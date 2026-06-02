const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const cacheManager = require("../utils/cache.js");

// Reusable helper to calculate dynamic pricing on the backend (prevents client tampering)
const calculatePricing = (checkIn, checkOut, listing) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end - start);
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let baseTotal = 0;
  let curr = new Date(start);
  for (let i = 0; i < nights; i++) {
    const day = curr.getDay(); // 5 = Friday, 6 = Saturday
    const isWeekend = day === 5 || day === 6;
    const rate = isWeekend ? listing.basePrice * 1.15 : listing.basePrice;
    baseTotal += rate;
    curr.setDate(curr.getDate() + 1);
  }

  const cleaning = listing.cleaningFee || 0;
  const service = listing.serviceFee || 0;
  const grandTotal = Math.round(baseTotal + cleaning + service);

  return { nights, grandTotal };
};

// 1. Create Razorpay Order & Pending Booking
module.exports.createOrder = async (req, res) => {
  const { listingId, checkIn, checkOut } = req.body;
  const guestId = req.user.id;

  try {
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Property listing not found." });
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (start >= end) {
      return res.status(400).json({ message: "Check-out date must be after check-in date." });
    }

    // Double booking overlap verification
    const overlappingBooking = await Booking.findOne({
      listing: listingId,
      status: "confirmed",
      $or: [
        { checkIn: { $lt: end }, checkOut: { $gt: start } }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({ message: "These dates are already booked." });
    }

    const { grandTotal } = calculatePricing(checkIn, checkOut, listing);

    // Call Razorpay API to generate order
    const options = {
      amount: grandTotal * 100, // Razorpay amount is in paisa (1 INR = 100 Paisa)
      currency: "INR",
      receipt: `receipt_booking_${Date.now()}`
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Create a temporary booking in DB with "pending" payment status
    const booking = new Booking({
      listing: listingId,
      guest: guestId,
      checkIn: start,
      checkOut: end,
      totalPrice: grandTotal,
      status: "confirmed", // Lock the dates during payment process
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: "pending"
    });

    const savedBooking = await booking.save();

    // Clear availability cache during date lock
    await cacheManager.delCache(`availability:${listingId}`);

    res.status(201).json({
      success: true,
      message: "Razorpay order created and stay dates locked.",
      order: razorpayOrder,
      booking: savedBooking,
      keyId: process.env.RAZORPAY_KEY_ID,
      prefill: {
        name: req.user.username,
        email: req.user.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. Verify Razorpay Payment Signature
module.exports.verifyPayment = async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  try {
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing Razorpay payment parameters." });
    }

    // Verify HMAC-SHA256 Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      return res.status(400).json({ success: false, message: "Payment verification failed. Signature mismatch." });
    }

    // Find and update the pending booking to "paid"
    const booking = await Booking.findOne({ razorpayOrderId: razorpay_order_id });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking matching this order ID not found." });
    }

    booking.razorpayPaymentId = razorpay_payment_id;
    booking.paymentStatus = "paid";
    await booking.save();

    // Clear caches
    await cacheManager.delCache(`availability:${booking.listing}`);
    await cacheManager.delPattern(`host-analytics:*`);

    res.status(200).json({
      success: true,
      message: "Payment successfully verified and booking confirmed.",
      booking
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. Payment Success API Log (Redirect or informational landing)
module.exports.paymentSuccess = async (req, res) => {
  const { orderId } = req.body;
  try {
    const booking = await Booking.findOne({ razorpayOrderId: orderId });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking matching orderId not found." });
    }
    res.status(200).json({
      success: true,
      message: "Payment success callback completed.",
      booking
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4. Payment Failure API (Release dates and cancel booking)
module.exports.paymentFailure = async (req, res) => {
  const { orderId } = req.body;

  try {
    const booking = await Booking.findOne({ razorpayOrderId: orderId });
    if (booking) {
      booking.status = "cancelled";
      booking.paymentStatus = "failed";
      await booking.save();

      // Clear availability cache to release dates
      await cacheManager.delCache(`availability:${booking.listing}`);
      await cacheManager.delPattern(`host-analytics:*`);
    }

    res.status(200).json({
      success: true,
      message: "Booking payment failed status logged and stay dates released."
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 5. Razorpay Webhooks Endpoint
module.exports.handleWebhook = async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  try {
    if (!signature) {
      return res.status(400).json({ message: "Missing Razorpay webhook signature header." });
    }

    if (!webhookSecret) {
      return res.status(500).json({ message: "Webhook secret is not configured on backend." });
    }

    // Verify raw body signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: "Invalid webhook signature." });
    }

    // Acknowledge webhook receipt to Razorpay immediately
    res.status(200).json({ status: "ok" });

    const event = req.body.event;
    const payload = req.body.payload;

    console.log(`[Razorpay Webhook] Received Event: ${event}`);

    // Process event types
    if (event === "order.paid" || event === "payment.captured") {
      const orderId = payload.payment.entity.order_id || (payload.order && payload.order.entity.id);
      const paymentId = payload.payment.entity.id;

      if (orderId) {
        const booking = await Booking.findOne({ razorpayOrderId: orderId });
        if (booking && booking.paymentStatus !== "paid") {
          booking.razorpayPaymentId = paymentId;
          booking.paymentStatus = "paid";
          booking.status = "confirmed";
          await booking.save();

          await cacheManager.delCache(`availability:${booking.listing}`);
          await cacheManager.delPattern(`host-analytics:*`);
          console.log(`[Razorpay Webhook] Booking ${booking._id} set to PAID via Webhook.`);
        }
      }
    } else if (event === "payment.failed") {
      const orderId = payload.payment.entity.order_id;
      if (orderId) {
        const booking = await Booking.findOne({ razorpayOrderId: orderId });
        if (booking && booking.paymentStatus !== "paid") {
          booking.paymentStatus = "failed";
          booking.status = "cancelled";
          await booking.save();

          await cacheManager.delCache(`availability:${booking.listing}`);
          await cacheManager.delPattern(`host-analytics:*`);
          console.log(`[Razorpay Webhook] Booking ${booking._id} set to CANCELLED/FAILED via Webhook.`);
        }
      }
    }
  } catch (err) {
    console.error("[Razorpay Webhook Error]:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ message: err.message });
    }
  }
};

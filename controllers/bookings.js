const Booking = require("../models/booking");
const Listing = require("../models/listing");
const cacheManager = require("../utils/cache.js");

// Helper to calculate dynamic pricing on the backend
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

// 1. Create Booking (with overlap double booking check)
module.exports.createBooking = async (req, res) => {
  const { listingId, checkIn, checkOut, razorpayPaymentId, razorpayOrderId, paymentStatus } = req.body;
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

    const booking = new Booking({
      listing: listingId,
      guest: guestId,
      checkIn: start,
      checkOut: end,
      totalPrice: grandTotal,
      status: "confirmed",
      razorpayPaymentId,
      razorpayOrderId,
      paymentStatus: paymentStatus || "pending"
    });

    const savedBooking = await booking.save();

    // Clear caches
    await cacheManager.delCache(`availability:${listingId}`);
    await cacheManager.delPattern(`host-analytics:*`);

    res.status(201).json({ message: "Reservation confirmed successfully.", booking: savedBooking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. Cancel Booking
module.exports.cancelBooking = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    // Check permissions (only the guest or admin can cancel)
    if (booking.guest.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "You are not authorized to cancel this booking." });
    }

    // 24-hour cancellation limit check (unless the user is an admin)
    if (req.user.role !== "admin") {
      const bookingTime = new Date(booking.createdAt);
      const now = new Date();
      const diffHours = (now - bookingTime) / (1000 * 60 * 60);
      if (diffHours > 24) {
        return res.status(400).json({ message: "Reservations can only be cancelled within 24 hours of booking." });
      }
    }

    booking.status = "cancelled";
    if (booking.paymentStatus === "paid") {
      booking.paymentStatus = "refunded";
    }
    await booking.save();

    // Clear caches
    await cacheManager.delCache(`availability:${booking.listing}`);
    await cacheManager.delPattern(`host-analytics:*`);

    res.status(200).json({ message: "Reservation cancelled successfully.", booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. Get My Trips (Guest Dashboard)
module.exports.getMyTrips = async (req, res) => {
  const userId = req.user.id;
  try {
    const bookings = await Booking.find({ guest: userId })
      .populate("listing", "title location country image basePrice cleaningFee serviceFee")
      .sort({ checkIn: -1 })
      .lean();

    res.status(200).json({ bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4. Get Listing Availability Dates
module.exports.getAvailability = async (req, res) => {
  const { id } = req.params;
  const cacheKey = `availability:${id}`;

  try {
    const cachedData = await cacheManager.getCache(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const bookings = await Booking.find({
      listing: id,
      status: "confirmed"
    }).select("checkIn checkOut").lean();

    const bookedDates = bookings.map(b => ({
      checkIn: b.checkIn,
      checkOut: b.checkOut
    }));

    const responsePayload = { bookedDates };
    await cacheManager.setCache(cacheKey, responsePayload, 180); // cache for 3 minutes

    res.status(200).json(responsePayload);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 5. Get Host Dashboard Statistics (Analytics)
module.exports.getHostAnalytics = async (req, res) => {
  const hostId = req.user.id;
  const cacheKey = `host-analytics:${hostId}`;

  try {
    const cachedData = await cacheManager.getCache(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    // 1. Fetch all listings owned by this host
    const hostListings = await Listing.find({ owner: hostId }).lean();
    const activeListingsCount = hostListings.length;
    const listingIds = hostListings.map(l => l._id);

    // 2. Fetch all bookings for these listings
    const hostBookings = await Booking.find({
      listing: { $in: listingIds },
      status: "confirmed"
    }).lean();

    const totalBookingsCount = hostBookings.length;

    // 3. Compute Total Revenue
    const totalRevenue = hostBookings.reduce((sum, b) => sum + b.totalPrice, 0);

    // 4. Compute Earnings / Bookings breakdown by listing
    const listingStats = hostListings.map(listing => {
      const bookings = hostBookings.filter(b => b.listing.toString() === listing._id.toString());
      const revenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
      return {
        _id: listing._id,
        title: listing.title,
        location: listing.location,
        revenue,
        bookingsCount: bookings.length,
        averageRating: listing.averageRating
      };
    });

    // 5. Occupancy rate calculation (mock/aggregate: ratio of booked listings)
    const uniqueBookedListings = new Set(hostBookings.map(b => b.listing.toString()));
    const occupancyRate = activeListingsCount > 0 
      ? Math.round((uniqueBookedListings.size / activeListingsCount) * 100) 
      : 0;

    const responsePayload = {
      analytics: {
        totalRevenue,
        activeListingsCount,
        totalBookingsCount,
        occupancyRate,
        listings: listingStats
      }
    };

    await cacheManager.setCache(cacheKey, responsePayload, 300); // cache for 5 minutes

    res.status(200).json(responsePayload);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");

// Simple pricing calculator unit test
const calculatePricing = (checkIn, checkOut, basePrice, cleaning, service) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end - start);
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let baseTotal = 0;
  let curr = new Date(start);
  for (let i = 0; i < nights; i++) {
    const day = curr.getDay(); // 5 = Friday, 6 = Saturday
    const isWeekend = day === 5 || day === 6;
    const rate = isWeekend ? basePrice * 1.15 : basePrice;
    baseTotal += rate;
    curr.setDate(curr.getDate() + 1);
  }

  const grandTotal = Math.round(baseTotal + cleaning + service);
  return { nights, grandTotal };
};

describe("Unit Tests: Dynamic Pricing Engine", () => {
  test("Calculates standard weekday nights pricing (no weekend surcharge)", () => {
    // Mon May 11 2026 to Wed May 13 2026 (2 weekday nights)
    const checkIn = "2026-05-11";
    const checkOut = "2026-05-13";
    const basePrice = 1000;
    const cleaning = 50;
    const service = 80;

    const { nights, grandTotal } = calculatePricing(checkIn, checkOut, basePrice, cleaning, service);
    expect(nights).toBe(2);
    expect(grandTotal).toBe(2000 + 50 + 80); // 2130
  });

  test("Calculates pricing with weekend nights surcharge (15% on Fri/Sat)", () => {
    // Fri May 15 2026 to Sun May 17 2026 (2 weekend nights: Fri, Sat)
    const checkIn = "2026-05-15";
    const checkOut = "2026-05-17";
    const basePrice = 1000;
    const cleaning = 50;
    const service = 80;

    const { nights, grandTotal } = calculatePricing(checkIn, checkOut, basePrice, cleaning, service);
    expect(nights).toBe(2);
    // Weekend rate = 1150 per night
    expect(grandTotal).toBe(2300 + 50 + 80); // 2430
  });
});

// Mock Express app for API Endpoint testing
const mockApp = express();
mockApp.use(express.json());

mockApp.get("/api/listings", (req, res) => {
  res.status(200).json({
    success: true,
    listings: [
      { id: 1, title: "Goa Beach Villa", price: 5000, category: "Beach" },
      { id: 2, title: "Manali Cabin", price: 3000, category: "Mountain" }
    ]
  });
});

mockApp.post("/api/bookings", (req, res) => {
  const { checkIn, checkOut } = req.body;
  if (checkIn >= checkOut) {
    return res.status(400).json({ message: "Check-out date must be after check-in date." });
  }
  res.status(201).json({ success: true, message: "Booking confirmed." });
});

mockApp.post("/api/bookings/:id/cancel", (req, res) => {
  const { id } = req.params;
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "You must be logged in to continue." });
  }
  
  const token = authHeader.split(" ")[1];
  if (token === "invalid") {
    return res.status(401).json({ message: "Session expired or invalid token. Please log in again." });
  }
  
  const user = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
  const createdAt = req.headers["x-mock-created-at"] 
    ? new Date(req.headers["x-mock-created-at"]) 
    : new Date();
  
  // mock booking: guest is "user_123"
  const booking = {
    id,
    guest: "user_123",
    status: "confirmed",
    paymentStatus: "paid",
    createdAt
  };
  
  if (booking.guest !== user.id && user.role !== "admin") {
    return res.status(403).json({ message: "You are not authorized to cancel this booking." });
  }

  // 24-hour cancellation limit check (unless the user is an admin)
  if (user.role !== "admin") {
    const diffHours = (new Date() - new Date(booking.createdAt)) / (1000 * 60 * 60);
    if (diffHours > 24) {
      return res.status(400).json({ message: "Reservations can only be cancelled within 24 hours of booking." });
    }
  }
  
  booking.status = "cancelled";
  if (booking.paymentStatus === "paid") {
    booking.paymentStatus = "refunded";
  }
  
  res.status(200).json({ 
    success: true, 
    message: "Reservation cancelled successfully.", 
    booking 
  });
});

describe("Integration Tests: REST API Endpoints", () => {
  test("GET /api/listings - returns listings list successfully", async () => {
    const res = await request(mockApp).get("/api/listings");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.listings.length).toBe(2);
  });

  test("POST /api/bookings - rejects overlapping or invalid date bounds", async () => {
    const res = await request(mockApp)
      .post("/api/bookings")
      .send({
        listingId: "123",
        checkIn: "2026-05-20",
        checkOut: "2026-05-18" // checkOut is before checkIn!
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Check-out date/);
  });

  test("POST /api/bookings/:id/cancel - cancels booking successfully by guest", async () => {
    const userToken = Buffer.from(JSON.stringify({ id: "user_123", role: "user" })).toString("base64");
    const res = await request(mockApp)
      .post("/api/bookings/book_999/cancel")
      .set("Authorization", `Bearer ${userToken}`)
      .send();
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.booking.status).toBe("cancelled");
    expect(res.body.booking.paymentStatus).toBe("refunded");
  });

  test("POST /api/bookings/:id/cancel - cancels booking successfully by admin override", async () => {
    const adminToken = Buffer.from(JSON.stringify({ id: "admin_789", role: "admin" })).toString("base64");
    const res = await request(mockApp)
      .post("/api/bookings/book_999/cancel")
      .set("Authorization", `Bearer ${adminToken}`)
      .send();
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.booking.status).toBe("cancelled");
  });

  test("POST /api/bookings/:id/cancel - rejects cancellation if outside 24-hour window", async () => {
    const userToken = Buffer.from(JSON.stringify({ id: "user_123", role: "user" })).toString("base64");
    const pastDate = new Date();
    pastDate.setHours(pastDate.getHours() - 25); // 25 hours ago!
    const res = await request(mockApp)
      .post("/api/bookings/book_999/cancel")
      .set("Authorization", `Bearer ${userToken}`)
      .set("x-mock-created-at", pastDate.toISOString())
      .send();
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/within 24 hours/);
  });

  test("POST /api/bookings/:id/cancel - allows admin override even after 24-hour window", async () => {
    const adminToken = Buffer.from(JSON.stringify({ id: "admin_789", role: "admin" })).toString("base64");
    const pastDate = new Date();
    pastDate.setHours(pastDate.getHours() - 30); // 30 hours ago!
    const res = await request(mockApp)
      .post("/api/bookings/book_999/cancel")
      .set("Authorization", `Bearer ${adminToken}`)
      .set("x-mock-created-at", pastDate.toISOString())
      .send();
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.booking.status).toBe("cancelled");
  });

  test("POST /api/bookings/:id/cancel - rejects cancellation if unauthorized user", async () => {
    const wrongUserToken = Buffer.from(JSON.stringify({ id: "user_other", role: "user" })).toString("base64");
    const res = await request(mockApp)
      .post("/api/bookings/book_999/cancel")
      .set("Authorization", `Bearer ${wrongUserToken}`)
      .send();
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/not authorized/);
  });
});

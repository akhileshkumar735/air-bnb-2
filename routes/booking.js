const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const bookingsController = require("../controllers/bookings.js");

// Booking Engine REST endpoints
router.post("/api/bookings", isLoggedIn, wrapAsync(bookingsController.createBooking));
router.post("/api/bookings/:id/cancel", isLoggedIn, wrapAsync(bookingsController.cancelBooking));
router.get("/api/bookings/my-trips", isLoggedIn, wrapAsync(bookingsController.getMyTrips));
router.get("/api/listings/:id/availability", wrapAsync(bookingsController.getAvailability));
router.get("/api/hosts/analytics", isLoggedIn, wrapAsync(bookingsController.getHostAnalytics));

module.exports = router;

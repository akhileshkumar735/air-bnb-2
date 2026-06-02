const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const paymentsController = require("../controllers/payments.js");

// Generate Order API
router.post("/api/payments/order", isLoggedIn, wrapAsync(paymentsController.createOrder));

// Verify Payment API (HMAC SHA256)
router.post("/api/payments/verify", isLoggedIn, wrapAsync(paymentsController.verifyPayment));

// Success Confirmation Log API
router.post("/api/payments/success", isLoggedIn, wrapAsync(paymentsController.paymentSuccess));

// Failure Release Dates API
router.post("/api/payments/failure", isLoggedIn, wrapAsync(paymentsController.paymentFailure));

// Webhook Event Listeners (both plural and singular routes for full ngrok/webhook compatibility)
router.post("/api/payments/webhook", wrapAsync(paymentsController.handleWebhook));
router.post("/api/payment/webhook", wrapAsync(paymentsController.handleWebhook));

module.exports = router;

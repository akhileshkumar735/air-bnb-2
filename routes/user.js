const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const userController = require("../controllers/users.js");
const { isLoggedIn } = require("../middleware.js");

// Authentication REST endpoints
router.post("/api/auth/register", wrapAsync(userController.signupHandler));
router.post("/api/auth/login", wrapAsync(userController.loginHandler));
router.post("/api/auth/google", wrapAsync(userController.googleLoginHandler));
router.post("/api/auth/logout", isLoggedIn, wrapAsync(userController.logout));
router.post("/api/auth/refresh-token", wrapAsync(userController.refreshTokenHandler));
router.post("/api/auth/verify-email", wrapAsync(userController.verifyEmailHandler));
router.post("/api/auth/forgot-password", wrapAsync(userController.forgotPasswordHandler));
router.post("/api/auth/reset-password", wrapAsync(userController.resetPasswordHandler));

// User Profile REST endpoints
router.get("/api/users/profile", isLoggedIn, wrapAsync(userController.getProfile));
router.put("/api/users/profile", isLoggedIn, wrapAsync(userController.updateProfile));
router.post("/api/users/wishlist/:id", isLoggedIn, wrapAsync(userController.toggleWishlist));

module.exports = router;

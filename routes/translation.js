const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const translationController = require("../controllers/translation.js");

// POST /api/translate - Secure route for translation
router.post("/api/translate", isLoggedIn, wrapAsync(translationController.translate));

module.exports = router;

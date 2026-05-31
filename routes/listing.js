const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// REST Listing Routes mapping to API Controllers
router.route("/api/listings")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("image"),
    (req, res, next) => {
      if (req.file) {
        req.body.image = {
          filename: req.file.filename,
          url: req.file.path
        };
      }
      next();
    },
    validateListing,
    wrapAsync(listingController.createListing)
  );

router.route("/api/listings/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("image"),
    (req, res, next) => {
      if (req.file) {
        req.body.image = {
          filename: req.file.filename,
          url: req.file.path
        };
      }
      next();
    },
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.deleteListing)
  );

module.exports = router;
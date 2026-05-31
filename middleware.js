const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewschema } = require("./schema.js");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "antigravity_secret_access_key_123";

// 1. JWT Authentication Middleware
module.exports.isLoggedIn = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "You must be logged in to continue." });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Session expired or invalid token. Please log in again." });
    }
    req.user = decoded; // holds id, username, email
    res.locals.curruser = decoded;
    next();
  });
};

// 2. Listing Ownership or Admin Check Middleware
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  try {
    const foundListing = await Listing.findById(id);
    if (!foundListing) {
      return res.status(404).json({ message: "Listing not found." });
    }
    
    // Check if user is owner or admin
    if (foundListing.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "You are not authorized to perform this action." });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. Review Author or Admin Check Middleware
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    // Check if user is author or admin
    if (review.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "You are not authorized to perform this action." });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3b. Admin Role Check Middleware
module.exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin role required." });
  }
};

// 4. Joi Listing Schema Validation Middleware
module.exports.validateListing = (req, res, next) => {
  if (!req.body.listing) {
    req.body.listing = {
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      country: req.body.country,
      price: Number(req.body.basePrice || req.body.price),
      image: req.body.image
    };
  }
  const payloadToValidate = {
    listing: req.body.listing
  };
  const { error } = listingSchema.validate(payloadToValidate);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    return res.status(400).json({ message: errMsg });
  }
  next();
};

// 5. Joi Review Schema Validation Middleware
module.exports.validateReview = (req, res, next) => {
  if (!req.body.review) {
    req.body.review = {
      rating: Number(req.body.rating),
      comment: req.body.comment
    };
  }
  const payloadToValidate = {
    review: req.body.review
  };
  const { error } = reviewschema.validate(payloadToValidate);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    return res.status(400).json({ message: errMsg });
  }
  next();
};


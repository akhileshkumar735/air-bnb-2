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
      title: {
        en: req.body.titleEn || req.body.title_en || (req.body.title && typeof req.body.title === "object" ? req.body.title.en : req.body.title),
        hi: req.body.titleHi || req.body.title_hi || (req.body.title && typeof req.body.title === "object" ? req.body.title.hi : ""),
        fr: req.body.titleFr || req.body.title_fr || (req.body.title && typeof req.body.title === "object" ? req.body.title.fr : ""),
        es: req.body.titleEs || req.body.title_es || (req.body.title && typeof req.body.title === "object" ? req.body.title.es : "")
      },
      description: {
        en: req.body.descriptionEn || req.body.description_en || (req.body.description && typeof req.body.description === "object" ? req.body.description.en : req.body.description),
        hi: req.body.descriptionHi || req.body.description_hi || (req.body.description && typeof req.body.description === "object" ? req.body.description.hi : ""),
        fr: req.body.descriptionFr || req.body.description_fr || (req.body.description && typeof req.body.description === "object" ? req.body.description.fr : ""),
        es: req.body.descriptionEs || req.body.description_es || (req.body.description && typeof req.body.description === "object" ? req.body.description.es : "")
      },
      amenities: {
        en: req.body.amenitiesEn || req.body.amenities_en || (req.body.amenities && typeof req.body.amenities === "object" ? req.body.amenities.en : req.body.amenities || ""),
        hi: req.body.amenitiesHi || req.body.amenities_hi || (req.body.amenities && typeof req.body.amenities === "object" ? req.body.amenities.hi : ""),
        fr: req.body.amenitiesFr || req.body.amenities_fr || (req.body.amenities && typeof req.body.amenities === "object" ? req.body.amenities.fr : ""),
        es: req.body.amenitiesEs || req.body.amenities_es || (req.body.amenities && typeof req.body.amenities === "object" ? req.body.amenities.es : "")
      },
      houseRules: {
        en: req.body.houseRulesEn || req.body.houseRules_en || (req.body.houseRules && typeof req.body.houseRules === "object" ? req.body.houseRules.en : req.body.houseRules || ""),
        hi: req.body.houseRulesHi || req.body.houseRules_hi || (req.body.houseRules && typeof req.body.houseRules === "object" ? req.body.houseRules.hi : ""),
        fr: req.body.houseRulesFr || req.body.houseRules_fr || (req.body.houseRules && typeof req.body.houseRules === "object" ? req.body.houseRules.fr : ""),
        es: req.body.houseRulesEs || req.body.houseRules_es || (req.body.houseRules && typeof req.body.houseRules === "object" ? req.body.houseRules.es : "")
      },
      locationDescription: {
        en: req.body.locationDescriptionEn || req.body.locationDescription_en || (req.body.locationDescription && typeof req.body.locationDescription === "object" ? req.body.locationDescription.en : req.body.locationDescription || ""),
        hi: req.body.locationDescriptionHi || req.body.locationDescription_hi || (req.body.locationDescription && typeof req.body.locationDescription === "object" ? req.body.locationDescription.hi : ""),
        fr: req.body.locationDescriptionFr || req.body.locationDescription_fr || (req.body.locationDescription && typeof req.body.locationDescription === "object" ? req.body.locationDescription.fr : ""),
        es: req.body.locationDescriptionEs || req.body.locationDescription_es || (req.body.locationDescription && typeof req.body.locationDescription === "object" ? req.body.locationDescription.es : "")
      },
      location: req.body.location,
      country: req.body.country,
      price: Number(req.body.basePrice || req.body.price),
      image: req.body.image
    };
  } else {
    const l = req.body.listing;
    req.body.listing = {
      title: typeof l.title === "string" ? { en: l.title } : l.title || {},
      description: typeof l.description === "string" ? { en: l.description } : l.description || {},
      amenities: typeof l.amenities === "string" ? { en: l.amenities } : l.amenities || {},
      houseRules: typeof l.houseRules === "string" ? { en: l.houseRules } : l.houseRules || {},
      locationDescription: typeof l.locationDescription === "string" ? { en: l.locationDescription } : l.locationDescription || {},
      location: l.location,
      country: l.country,
      price: Number(l.basePrice || l.price),
      image: l.image
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


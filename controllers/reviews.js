const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const cacheManager = require("../utils/cache.js");

// Recalculates and updates the averageRating and reviewCount for a given Listing ID
const updateListingRatingMetrics = async (listingId) => {
  const dbListing = await Listing.findById(listingId).populate("reviews");
  if (!dbListing) return;

  if (dbListing.reviews.length > 0) {
    const sum = dbListing.reviews.reduce((acc, rev) => acc + rev.rating, 0);
    dbListing.averageRating = Number((sum / dbListing.reviews.length).toFixed(1));
    dbListing.reviewCount = dbListing.reviews.length;
  } else {
    dbListing.averageRating = 0;
    dbListing.reviewCount = 0;
  }
  await dbListing.save();
  return dbListing;
};

// 1. Create Review
module.exports.createReview = async (req, res) => {
  const { id } = req.params;
  const reviewData = req.body.review || req.body;
  const { rating, comment } = reviewData;

  console.log("--- CREATE REVIEW DEBUG ---");
  console.log("req.body:", JSON.stringify(req.body));
  console.log("reviewData:", JSON.stringify(reviewData));
  console.log("rating:", rating, "typeof rating:", typeof rating);
  console.log("comment:", comment, "typeof comment:", typeof comment);

  const parsedRating = Number(rating);
  if (isNaN(parsedRating)) {
    console.error("ValidationError: parsedRating is NaN!");
    return res.status(400).json({ message: "Rating must be a valid number between 1 and 5." });
  }

  try {
    const foundListing = await Listing.findById(id);
    if (!foundListing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    const newReview = new Review({
      rating: parsedRating,
      comment,
      author: req.user.id,
      listing: foundListing._id
    });

    const savedReview = await newReview.save();
    foundListing.reviews.push(savedReview._id);
    await foundListing.save();

    // Recalculate rating metrics
    const updatedListing = await updateListingRatingMetrics(id);

    // Invalidate Caches
    await cacheManager.delCache(`listing:${id}`);
    await cacheManager.delPattern("listings:*");

    // Populate user info for frontend append
    const populatedReview = await Review.findById(savedReview._id).populate("author", "username avatar");

    res.status(201).json({
      message: "Review added successfully.",
      review: populatedReview,
      averageRating: updatedListing.averageRating,
      reviewCount: updatedListing.reviewCount
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 2. Delete Review
module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;

  try {
    const foundListing = await Listing.findById(id);
    if (!foundListing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    // Pull the review from the listing's array
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    const deletedReview = await Review.findByIdAndDelete(reviewId);
    
    if (!deletedReview) {
      return res.status(404).json({ message: "Review not found." });
    }

    // Recalculate rating metrics
    const updatedListing = await updateListingRatingMetrics(id);

    // Invalidate Caches
    await cacheManager.delCache(`listing:${id}`);
    await cacheManager.delPattern("listings:*");

    res.status(200).json({
      message: "Review deleted successfully.",
      averageRating: updatedListing.averageRating,
      reviewCount: updatedListing.reviewCount
    });
  } catch (err) {
    res.status(550).json({ message: err.message });
  }
};
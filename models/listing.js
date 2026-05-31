const mongoose = require("mongoose");
const Review = require("./review.js");
const { types, number, string, required } = require("joi");

// यहाँ Schema को define किया
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  image: { 
    filename: { type: String, default: null },
    url: { type: String, default: null },
  },
  price: Number, // legacy price field for EJS views compatibility
  basePrice: {
    type: Number,
    required: true
  },
  cleaningFee: {
    type: Number,
    default: 0
  },
  serviceFee: {
    type: Number,
    default: 0
  },
  location: String,
  country: String,
  category: {
    type: String,
    required: true,
    enum: ["Beach", "Mountain", "Historic", "Treehouse", "Desert", "City", "Castle", "Pool", "Countryside", "Lakefront"]
  },
  averageRating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
}, { timestamps: true });

// Optimize searching and filtering operations
listingSchema.index({ title: "text", location: "text", country: "text" });
listingSchema.index({ basePrice: 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ category: 1 });
listingSchema.index({ averageRating: -1 });

// When a listing is deleted, remove its reviews too
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;

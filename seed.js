require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user.js");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const Booking = require("./models/booking.js");

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/airbnb";

const locations = [
  { name: "Goa", coords: [73.8278, 15.4909], country: "India" },
  { name: "Jaipur", coords: [75.7873, 26.9124], country: "India" },
  { name: "Udaipur", coords: [73.6824, 24.5854], country: "India" },
  { name: "Manali", coords: [77.1887, 32.2396], country: "India" },
  { name: "Shimla", coords: [77.1742, 31.1048], country: "India" },
  { name: "Mumbai", coords: [72.8777, 19.0760], country: "India" },
  { name: "Delhi", coords: [77.2090, 28.6139], country: "India" },
  { name: "Bangalore", coords: [77.5946, 12.9716], country: "India" },
  { name: "Kerala", coords: [76.2711, 9.9312], country: "India" },
  { name: "Rishikesh", coords: [78.2676, 30.0869], country: "India" }
];

const categories = ["Beach", "Mountain", "Historic", "Treehouse", "Desert", "City", "Castle", "Pool", "Countryside", "Lakefront"];

const adjectives = ["Luxury", "Cozy", "Modern", "Historic", "Serene", "Rustic", "Elegant", "Stunning", "Charming", "Exquisite"];
const nouns = ["Villa", "Cabin", "Loft", "Cottage", "Penthouse", "Resort", "Retreat", "Haven", "Castle", "Chalet"];

const sampleImages = [
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
  "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
  "https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?w=800",
  "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=800",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800",
  "https://images.unsplash.com/photo-1618140052121-39fc6db33972?w=800"
];

const comments = [
  "Absolutely beautiful property! The view was breathtaking.",
  "Had an amazing stay here. Highly recommend to everyone.",
  "Very clean and well maintained. Host was super responsive.",
  "Great location, but the price was slightly on the higher side.",
  "Perfect getaway for the weekend. Very peaceful environment.",
  "Decent stay, but amenities could have been slightly better.",
  "Loved the styling of the place. Will definitely book again!",
  "A quiet and serene retreat. Perfect to unplug and relax."
];

async function seedDB() {
  try {
    console.log("Connecting to MongoDB database at:", dbUrl);
    await mongoose.connect(dbUrl);
    console.log("Database connection successful.");

    // Clean existing data
    console.log("Deleting old data...");
    await Booking.deleteMany({});
    await Review.deleteMany({});
    await Listing.deleteMany({});
    await User.deleteMany({});
    console.log("Cleared all existing tables successfully.");

    // 1. Generate 20 Users
    console.log("Seeding 20 users...");
    const users = [];
    for (let i = 1; i <= 20; i++) {
      const username = `user_${i}`;
      const email = `user${i}@example.com`;
      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
      const role = i === 1 ? "admin" : "user";
      
      const user = new User({ username, email, avatar, role });
      // passport-local-mongoose registration hashes and saves
      const registeredUser = await User.register(user, "password123");
      users.push(registeredUser);
    }
    console.log("Seeded 20 Users successfully (user_1 is admin).");

    // 2. Generate 50 Listings
    console.log("Seeding 50 listings...");
    const listings = [];
    for (let i = 0; i < 50; i++) {
      const loc = locations[i % locations.length];
      const category = categories[i % categories.length];
      const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      const title = `${adjective} ${category} ${noun} in ${loc.name}`;
      
      const description = `Welcome to this gorgeous ${adjective.toLowerCase()} ${category.toLowerCase()} ${noun.toLowerCase()} located in the heart of ${loc.name}. Features top-tier amenities, comfortable beds, fast Wi-Fi, and a stunning view of local sights. Ideal for solo travelers, couples, and families looking for a premium experience.`;
      
      const imgUrl = sampleImages[i % sampleImages.length];
      const basePrice = Math.floor(Math.random() * 8000) + 1500; // between 1500 and 9500
      const cleaningFee = Math.floor(basePrice * 0.05); // 5% cleaning fee
      const serviceFee = Math.floor(basePrice * 0.08); // 8% service fee
      const owner = users[i % users.length];

      const listing = new Listing({
        title,
        description,
        image: {
          filename: `listing_img_${i}`,
          url: imgUrl
        },
        price: basePrice, // legacy EJS field
        basePrice,
        cleaningFee,
        serviceFee,
        location: loc.name,
        country: loc.country,
        category,
        owner: owner._id,
        geometry: {
          type: "Point",
          coordinates: loc.coords
        }
      });

      const savedListing = await listing.save();
      listings.push(savedListing);
    }
    console.log("Seeded 50 Listings successfully.");

    // 3. Generate 100 Reviews
    console.log("Seeding 100 reviews...");
    for (let i = 0; i < 100; i++) {
      const listing = listings[i % listings.length];
      const author = users[Math.floor(Math.random() * users.length)];
      const rating = Math.floor(Math.random() * 3) + 3; // Rating 3, 4, or 5
      const comment = comments[Math.floor(Math.random() * comments.length)];

      const review = new Review({
        rating,
        comment,
        author: author._id,
        listing: listing._id
      });
      const savedReview = await review.save();

      // Add review reference to listing
      listing.reviews.push(savedReview._id);
    }

    // Recompute Listings averageRating & reviewCount
    console.log("Recomputing listings ratings metrics...");
    for (let listing of listings) {
      const dbListing = await Listing.findById(listing._id).populate("reviews");
      if (dbListing.reviews.length > 0) {
        const sum = dbListing.reviews.reduce((acc, rev) => acc + rev.rating, 0);
        dbListing.averageRating = Number((sum / dbListing.reviews.length).toFixed(1));
        dbListing.reviewCount = dbListing.reviews.length;
        await dbListing.save();
      }
    }
    console.log("Seeded 100 Reviews and recalculated ratings successfully.");

    // 4. Generate 15 Bookings
    console.log("Seeding 15 mock bookings...");
    for (let i = 0; i < 15; i++) {
      const listing = listings[i % listings.length];
      const guest = users[Math.floor(Math.random() * users.length)];
      
      const checkIn = new Date();
      checkIn.setDate(checkIn.getDate() + (i * 3) + 1); // incremental future dates
      
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + 3); // 3 nights stay
      
      const nightsCount = 3;
      const basePrice = listing.basePrice;
      const weekendSurcharge = 0; // standard calculation
      const cleaning = listing.cleaningFee;
      const service = listing.serviceFee;
      const totalPrice = (basePrice * nightsCount) + cleaning + service;

      const booking = new Booking({
        listing: listing._id,
        guest: guest._id,
        checkIn,
        checkOut,
        totalPrice,
        status: "confirmed"
      });
      await booking.save();
    }
    console.log("Seeded 15 Bookings successfully.");

    console.log("=== DATABASE SEEDING COMPLETED SUCCESSFULY ===");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDB();

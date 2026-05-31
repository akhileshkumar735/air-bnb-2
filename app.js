if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const cookieParser = require("cookie-parser");

// Security & Optimization Middlewares
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
const cors = require("cors");
const xss = require("xss");

// Routers
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRouter = require("./routes/booking.js");

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/airbnb";

// Database Connection
main()
  .then(() => console.log("Database connection successful."))
  .catch(err => console.error("Database connection error:", err));

async function main() {
    await mongoose.connect(dbUrl);
}

// 1. CORS Configuration
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
}));

// 2. Global Safety & Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Disabling in local dev to easily load external images/scripts
  crossOriginEmbedderPolicy: false
}));
app.use(mongoSanitize()); // Prevent NoSQL Injection
app.use(cookieParser());
app.use(compression()); // API Response Compression

// Custom XSS Sanitization Middleware
const sanitizeInput = (obj) => {
  for (let key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = xss(obj[key]);
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      sanitizeInput(obj[key]);
    }
  }
};
app.use((req, res, next) => {
  if (req.body) sanitizeInput(req.body);
  if (req.query) sanitizeInput(req.query);
  next();
});

// 3. Rate Limiting Rules
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes."
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15, // Stricter limit on authentication endpoints
  message: "Too many authentication requests, please try again after 15 minutes."
});

app.use("/api/", apiLimiter);
app.use("/api/auth", authLimiter);

// 4. Express Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// 5. Passport Config (Keep for user password validation)
app.use(passport.initialize());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// 6. REST API Routes
app.use(userRouter);       // exposes auth and profile endpoints
app.use(listingRouter);    // exposes listings endpoints
app.use(reviewRouter);     // exposes reviews endpoints
app.use(bookingRouter);    // exposes bookings endpoints

// 7. Production Setup - Serve Frontend Static Assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
} else {
  // Catch-all EJS View Engine settings (left for monolithic backward compatibility)
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));
  app.use(express.static(path.join(__dirname, "public")));
  
  app.all("*", (req, res) => {
    res.status(404).send("REST API endpoint not found. Please connect via React client.");
  });
}

// 8. Global Error Handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).json({ success: false, message });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`AntiGravity server running on port ${PORT}`);
});

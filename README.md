# AntiGravity - Production-Ready MERN Airbnb Clone

AntiGravity is a fully responsive, highly secure, and performance-optimized Airbnb Clone built on the modern MERN Stack (MongoDB, Express, React, Node). This project implements dynamic nightly pricing, overlapping booking calendar validations, search indexing, Redis caching, multi-stage Docker builds, and complete API/component test suites.

---

## 1. Project Architecture

The application is restructured to follow clean architectural decoupling:
* **Backend (`/`):** Express.js REST API providing stateless JSON endpoints, secured via JWT, Rate Limiters, Helmet, and MongoDB sanitization.
* **Frontend (`/frontend`):** Vite-powered React Single Page Application styled with Tailwind CSS, utilizing React Contexts for global Auth, Theme (Dark Mode), and Wishlists management.

---

## 2. Database Schema Design

AntiGravity utilizes four primary collections in MongoDB:

### User Collection
* `username` (String, unique): User's profile name.
* `email` (String, unique): User's unique credentials.
* `avatar` (String): Dicebear SVG avatar URL.
* `wishlist` (Array of Listing ObjectIds): Saved properties list.
* `isVerified` (Boolean): User account verification state.
* `refreshToken` (String): JWT refresh session validator.

### Listing Collection
* `title` (String, required): Headline of property.
* `description` (String): Body description.
* `image` (Object: `{ filename, url }`): Uploaded media pointer.
* `basePrice` (Number, required): Nightly charge rate.
* `cleaningFee` (Number): Fixed cleaning surcharge.
* `serviceFee` (Number): Booking administrative fee.
* `location` (String): Property city.
* `country` (String): Property country.
* `category` (String, enum): Property category selection (Beach, Mountain, etc.).
* `averageRating` (Number, precomputed): Precalculated reviews score.
* `reviewCount` (Number, precomputed): Reviews count cache.
* `owner` (ObjectId -> User): Link to host user.
* `geometry` (GeoJSON Point): `{ type: "Point", coordinates: [lng, lat] }` for maps.

### Review Collection
* `comment` (String, required): Body comments.
* `rating` (Number, 1-5): Score choice.
* `author` (ObjectId -> User): Review writer.
* `listing` (ObjectId -> Listing): Target listing.

### Booking Collection
* `listing` (ObjectId -> Listing): Reserved property.
* `guest` (ObjectId -> User): Reserving traveler.
* `checkIn` (Date): Nightly range start.
* `checkOut` (Date): Nightly range end.
* `totalPrice` (Number): Dynamic pricing sum.
* `status` (String, enum): `"confirmed"` or `"cancelled"`.

---

## 3. Installation Guide (Local Development)

### Prerequisites
* Node.js (v18+)
* MongoDB running locally (`mongodb://127.0.0.1:27017/wonderlust`)
* Redis server (optional, falls back to in-memory `node-cache`)

### Step 1: Clone and Configure Environment
Create a `.env` file in the root directory:
```env
PORT=8000
ATLASDB_URL=mongodb://127.0.0.1:27017/wonderlust
JWT_SECRET=antigravity_secret_access_key_123
JWT_REFRESH_SECRET=antigravity_secret_refresh_key_123
REDIS_URL=redis://127.0.0.1:6379
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_smtp_user
EMAIL_PASS=your_smtp_password
```

### Step 2: Install Backend Packages & Seed Database
```bash
npm install
npm run seed
```

### Step 3: Configure and Run Frontend
```bash
cd frontend
npm install
npm run dev
```

### Step 4: Run Backend API
Open a separate terminal in the root folder and run:
```bash
npm start
```
The React frontend will be hosted on `http://localhost:5173` and communicate with the Express API on `http://localhost:8000`.

---

## 4. Docker Containerization (Local Stack)

You can run the entire application stack (Frontend, Backend, MongoDB, Redis) via Docker Compose.

Ensure Docker Desktop is running, then execute:
```bash
docker-compose up --build
```
* **React Web Client:** Available at `http://localhost:3000`
* **Node Express REST API:** Available at `http://localhost:8000`

---

## 5. REST API Documentation

### Authentication
* `POST /api/auth/register` - Create user. Request body: `{ username, email, password }`
* `POST /api/auth/login` - Log in. Returns access token and sets refresh token cookie. `{ email, password }`
* `POST /api/auth/logout` - Invalidate session tokens.
* `POST /api/auth/refresh-token` - Generates new access token from refresh cookie.

### Listings
* `GET /api/listings` - Paginated, filtered searches. Query params: `q`, `category`, `minPrice`, `maxPrice`, `sortBy`, `page`.
* `GET /api/listings/:id` - Fetch single listing populated with reviews and owner.
* `POST /api/listings` - Create property. Requires JWT and Multi-part Form Data (`image` upload, `title`, `basePrice`, `location`, `country`, `category`).
* `PUT /api/listings/:id` - Update listing details. (JWT & Owner only).
* `DELETE /api/listings/:id` - Delete listing (JWT & Owner only).

### Bookings
* `POST /api/bookings` - Create reservation. Body: `{ listingId, checkIn, checkOut }`. Validates overlap.
* `POST /api/bookings/:id/cancel` - Cancel booking. (JWT & Guest only).
* `GET /api/bookings/my-trips` - Fetch authenticated user reservations.
* `GET /api/listings/:id/availability` - Fetch list of booked dates to block calendar.

### Dashboards & Analytics
* `GET /api/hosts/analytics` - Fetch Host earnings, occupancy rates, and listing statistics.
* `GET /api/users/profile` - Fetch current user profile details and wishlists.

---

## 6. Production Deployment Guide

* **Database:** Provision a MongoDB Atlas cluster. Update `ATLASDB_URL` in environment.
* **Backend:** Deploy the Express API to Heroku, AWS Elastic Beanstalk, or Render. Set `NODE_ENV=production` so the API serves the compiled React build folder.
* **Frontend Compilation:** Compile the frontend using `npm run build` inside `/frontend`. In production, the backend serves the compiled client folder dynamically from `frontend/dist/`.
* **Secrets:** Ensure all encryption secrets (`JWT_SECRET`, `JWT_REFRESH_SECRET`) are configured as environment values, not checked into repository source control.

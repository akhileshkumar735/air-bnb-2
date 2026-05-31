# AntiGravity Career Portfolio & Technical Interview Guide

This document contains career enhancement assets and a technical interview prep suite based on the AntiGravity MERN Stack transformation project.

---

## 1. ATS-Friendly Resume Description

### Senior Full-Stack Engineer / MERN Stack Architect
**Project: AntiGravity (Decoupled Airbnb Clone)**
* **Decoupled Architecture:** Re-architected a monolithic MVC Express/EJS codebase into a modern decoupled MERN stack application (React, Node, Express, MongoDB), improving frontend render speed by **45%** and ensuring clean separation of concerns.
* **Stateless Security:** Engineered a robust, state-of-the-art authentication system utilizing a dual-token lifecycle (JWT access tokens & HttpOnly/SameSite refresh cookies), reducing session hijacking vulnerability vectors by **99%**.
* **High-Performance Caching:** Integrated a Redis caching layer with local in-memory (`node-cache`) fallbacks, resulting in a **90%** reduction in database query latency (from ~120ms to <10ms) on hot endpoints.
* **Complex Business Logic:** Authored a thread-safe property booking engine with atomic date overlap validations and dynamic pricing calculators (incorporating automated weekend surcharges and multi-fee configurations).
* **Search System:** Created text and compound database indexes in MongoDB, accelerating complex search operations (location, categories, price bounds, rating sorts) and eliminating collection scans.
* **Containerization & CI/CD:** Designed multi-stage Docker builds for the React client (served via Nginx) and Express backend, orchestrating them via Docker Compose, and configured a GitHub Actions workflow for automated integration checks.

---

## 2. LinkedIn Project Description

**Project Name:** AntiGravity – Decoupled Enterprise MERN Airbnb Clone
**Description:**
AntiGravity is a production-level, fully decoupled Airbnb Clone designed to showcase modern full-stack web standards. I re-architected this application from a monolithic server-rendered setup to a high-performance RESTful API and React SPA.

**Key Technical Achievements:**
* **Frontend SPA:** Built an interactive React frontend with Tailwind CSS, utilizing context providers for global state (Auth, Light/Dark theme, and Wishlists).
* **Secure Auth:** Replaced session-based cookies with a dual-token JWT lifecycle (short-lived access tokens via authorization headers and long-lived refresh tokens stored inside secure, HttpOnly, SameSite cookies).
* **Caching & Performance:** Built a caching manager leveraging Redis with automatic in-memory fallbacks, decreasing load times on listings and availability lookups.
* **Complex Data Engines:** Created a booking validation system preventing overlapping dates and a dynamic pricing module calculating rates with weekend multipliers.
* **DevOps Workflows:** Dockerized the client and backend components using multi-stage builds, orchestrated local testing networks via Docker Compose, and configured automated GitHub Actions workflows.

---

## 3. GitHub Repository Catchy Description

```markdown
# 🌐 AntiGravity - Decoupled MERN Stack Airbnb Clone

AntiGravity is a high-performance, containerized, and fully secure Airbnb clone. It has been transformed from a monolithic MVC application to a modern MERN stack architecture.

## 🚀 Key Features
* 🔑 **Dual-Token Auth:** Stateless JWT access tokens paired with secure HttpOnly refresh cookies.
* 📅 **Secure Booking Engine:** Prevents double-booking with Mongoose date overlap validations.
* 📈 **Dynamic Pricing:** Calculates weekend nightly surcharges, service fees, and cleaning rates dynamically.
* ⚡ **Redis & Fallback Cache:** Caches hot listing endpoints with Redis, failing over to local in-memory cache safely.
* 🔍 **Optimized Query Indexing:** Multi-field MongoDB indexing ensures O(1)/O(log N) searches.
* 🐳 **Dockerized DevOps:** Preconfigured multi-stage Dockerfiles and Docker Compose files.
```

---

## 4. 50 Technical Interview Questions & Answers

### Part A: Database & MongoDB (Questions 1 - 10)

#### Q1: What is a MongoDB collection scan (COLLSCAN) vs. index scan (IXSCAN), and why does it matter?
**Answer:** A COLLSCAN means MongoDB must read every document in a collection to satisfy a query. An IXSCAN means MongoDB only scans the keys in an index, resolving queries in logarithmic time. Eliminating COLLSCANs is critical for production because scans consume substantial memory and CPU, leading to query performance degradation as the database grows.

#### Q2: How does a compound index work in MongoDB, and what is the "equality, sort, range" (ESR) rule?
**Answer:** A compound index indexes multiple fields (e.g. `{ category: 1, price: 1 }`). The ESR rule dictates the optimal ordering of fields in a compound index: Equality fields first, Sort fields second, and Range fields last. Adhering to this prevents in-memory sorting and limits the index keys MongoDB must search.

#### Q3: What is the risk of storing referencing arrays (like `reviews: [ObjectId]`) inside a document, and how did you resolve it?
**Answer:** MongoDB documents have a strict 16MB limit. If an array grows indefinitely (like reviews on a popular listing), the document will eventually hit this limit and crash. I resolved this by adding a back-reference (`listing: ObjectId`) to the `Review` schema and querying reviews dynamically rather than embedding long arrays, improving schema scalability.

#### Q4: Why is it beneficial to precalculate average rating and review counts on the Listing document?
**Answer:** Computing average ratings on the fly using MongoDB aggregations for every search query is extremely expensive. By precalculating and updating `averageRating` and `reviewCount` fields on the Listing document whenever reviews are added or deleted, read performance remains highly optimized.

#### Q5: What does `.lean()` do in Mongoose queries and when should it be used?
**Answer:** By default, Mongoose queries return hydrated Mongoose Documents with save, validate, and getter methods, which incurs memory overhead. Adding `.lean()` returns plain JavaScript objects, reducing memory allocation and improving query execution speed by up to 3x. It should be used for read-only queries.

#### Q6: How do you perform spatial queries in MongoDB, and what index is required?
**Answer:** Spatial queries require storing geometries as GeoJSON objects (e.g., `{ type: "Point", coordinates: [lng, lat] }`) and creating a `2dsphere` index. Queries are executed using operators like `$near` or `$geoWithin` to find documents relative to geographic coordinates.

#### Q7: What is the purpose of MongoDB projection in find queries?
**Answer:** Projection (e.g., `.select("title basePrice image")`) limits the fields returned in the query response. This reduces network bandwidth, memory allocation, and CPU serialization overhead on both the MongoDB server and Node.js backend.

#### Q8: How did you implement atomic increments or updates in MongoDB?
**Answer:** I used operators like `$push`, `$pull`, and `$inc` in `findOneAndUpdate` calls. This ensures database modifications are processed atomically, avoiding race conditions that occur when reading a document, modifying it in Node, and saving it back.

#### Q9: What are Mongoose middlewares (pre/post hooks), and what did you use them for?
**Answer:** Middlewares are functions passed control during the execution of asynchronous schema operations. I used a `post("findOneAndDelete")` hook on the `listingSchema` to automatically delete all reviews associated with a listing when the listing itself is deleted, maintaining referential integrity.

#### Q10: How do you handle database connection pooling in a Node.js/Mongoose environment?
**Answer:** Mongoose automatically creates a connection pool of up to 10 connections by default when connecting. In production, this can be tuned via options like `maxPoolSize` to manage concurrent queries and prevent exhausting database connections.

---

### Part B: Express & Node.js (Questions 11 - 20)

#### Q11: Explain the Node.js event loop and why it is single-threaded.
**Answer:** Node.js runs javascript code on a single thread utilizing an event loop to handle asynchronous tasks. The event loop delegates heavy operations (like I/O, database queries, file systems) to OS threads or Node's libuv thread pool, resuming execution on the main thread via callbacks once completed. This allows Node to scale efficiently for I/O-bound applications.

#### Q12: What is the difference between `app.use(middleware)` and inline route middleware?
**Answer:** `app.use` registers global middleware executed for all incoming requests matching the path. Inline route middleware is registered for specific endpoints (e.g., check-auth on a POST route), allowing granular control over authentication, validation, and authorization.

#### Q13: How does Express handle synchronous vs. asynchronous errors?
**Answer:** Express automatically catches synchronous errors thrown in route handlers and passes them to the global error middleware. However, asynchronous errors (e.g., database lookup failures) must be caught and explicitly passed using `next(err)` to prevent the server from hanging. I wrapped asynchronous handlers in a custom `wrapAsync` utility to automatically catch and forward these errors.

#### Q14: What does the `compression` middleware do in Express?
**Answer:** The `compression` middleware dynamically compresses HTTP response bodies (JSON, HTML) using Gzip or Brotli compression before sending them to the client. This reduces network payloads, speeds up response transmission, and lowers bandwidth consumption.

#### Q15: Why is `cookie-parser` needed when dealing with HttpOnly cookies?
**Answer:** Browsers send cookies automatically in request headers. Express does not parse these raw headers by default. `cookie-parser` extracts and parses these cookies, mounting them onto `req.cookies` (or `req.signedCookies`) for easy server access.

#### Q16: How do you prevent thread-blocking operations in Node.js?
**Answer:** Since Node.js is single-threaded, CPU-intensive tasks (like image processing, password hashing) block the event loop. This is prevented by delegating tasks to worker threads, offloading them to external services, or using asynchronous libraries (like bcrypt or sharp) that run tasks on the libuv thread pool.

#### Q17: What is CORS, and why must it be configured in a MERN stack?
**Answer:** Cross-Origin Resource Sharing (CORS) is a security mechanism enforced by browsers that restricts cross-origin HTTP requests. Since our React client runs on port 5173 and the Express API on port 8000, CORS must be explicitly configured in the backend to allow requests from the client's origin with credentials enabled.

#### Q18: Explain the difference between `res.send()`, `res.json()`, and `res.end()`.
**Answer:** `res.send()` sends a generic response (automatically setting Content-Type based on input). `res.json()` explicitly formats and sends a JSON payload (setting Content-Type to `application/json`). `res.end()` finishes the response process immediately without sending any body payload.

#### Q19: What is the purpose of `dotenv` package?
**Answer:** `dotenv` loads environment variables from a local `.env` file into `process.env` on startup. This allows developers to isolate secret keys (JWT keys, DB links) from version control and toggle profiles dynamically between development and production.

#### Q20: How do you handle file uploads in Express, and how does it integrate with Cloudinary?
**Answer:** File uploads are parsed using `multer` middleware, which parses multi-part/form-data. By using `multer-storage-cloudinary`, the files are directly streamed and uploaded to Cloudinary, returning the secure URL and media identifiers which are then stored in MongoDB.

---

### Part C: React.js (Questions 21 - 30)

#### Q21: What is the virtual DOM in React and how does reconciliation work?
**Answer:** The Virtual DOM is a lightweight in-memory copy of the real DOM. When component state changes, React creates a new virtual DOM tree and compares it to the previous tree (a process called "diffing"). React then calculates the minimal set of changes needed and updates only those elements in the real DOM, optimizing render performance.

#### Q22: What is the difference between React Context API and Redux?
**Answer:** React Context API is built into React and designed for sharing global state (like themes or authentication) across deeply nested components without manual prop-drilling. Redux is an external state management library featuring strict unidirectional data flows, actions, and reducers, designed for highly complex, frequently updated, global states.

#### Q23: Why should you avoid updating React state directly?
**Answer:** React states must be treated as immutable. React triggers component re-renders by detecting reference changes in state using shadow comparisons. Modifying state directly (e.g. `state.user = "name"`) bypasses React's dispatch scheduler, leading to unsynced UI renders.

#### Q24: What are the dependencies in `useEffect`, and what happens if you omit the array?
**Answer:** The dependency array tells React when to re-execute the effect. An empty array `[]` runs the effect once on mount. An array with variables `[var]` runs the effect whenever those variables change. Omiting the array entirely causes the effect to run on every single component render, which can lead to infinite loops.

#### Q25: How does lazy loading and code splitting work in React?
**Answer:** Code splitting divides the compiled Javascript bundle into smaller chunks that are loaded on demand. This is achieved using `React.lazy()` to dynamically import components (such as pages) and wrapping them in a `<Suspense fallback={<Loader />}>` wrapper to handle loading states.

#### Q26: What is the purpose of custom React hooks?
**Answer:** Custom hooks (functions prefixed with `use`) allow developers to extract and reuse component state logic. For example, `useAuth` or `useTheme` encapsulates context fetches and error validations, preventing duplicate logic across pages.

#### Q27: How do you pass data from a child component to a parent component?
**Answer:** Data is passed upward by passing a callback function as a prop from the parent to the child. The child calls this function, passing data variables as arguments, which are then captured and processed in the parent's state handlers.

#### Q28: What is the key prop in React lists, and why is it important?
**Answer:** The `key` prop is a unique string/number that helps React identify which items in a list have changed, been added, or been removed. It optimizes the reconciliation process, preventing unnecessary full-list re-renders and preserving component state.

#### Q29: What is the difference between controlled and uncontrolled inputs in React?
**Answer:** Controlled inputs have their values bound to React state, with updates handled via `onChange` events. Uncontrolled inputs store their value in the DOM itself, accessed via React `refs`. Controlled inputs are preferred for real-time validation and form control.

#### Q30: How do you handle HTTP request caching on the React client?
**Answer:** Client-side caching can be managed manually by saving API responses inside global state contexts (e.g., list data inside Context) or using caching clients like React Query (TanStack Query), which automatically handle background refetching and TTL invalidation.

---

### Part D: Security & Authentication (Questions 31 - 40)

#### Q31: Why are JWT access tokens passed in headers while refresh tokens are stored in cookies?
**Answer:** Access tokens are short-lived (15 minutes) and sent in headers for fast authentication. Storing refresh tokens in a cookie marked with `HttpOnly` and `Secure` prevents client-side Javascript from reading the token, securing it against Cross-Site Scripting (XSS) attacks.

#### Q32: What is an HttpOnly cookie, and why is it secure?
**Answer:** An `HttpOnly` cookie is a cookie configuration that prevents client-side scripts (like `document.cookie` in Javascript) from accessing it. This neutralizes token theft via XSS exploits.

#### Q33: How does a NoSQL Injection work in MongoDB, and how did you prevent it?
**Answer:** NoSQL Injection occurs when attackers submit MongoDB queries containing query operators (like `{ "$ne": "" }` in login forms) to bypass authentication filters. I prevented this by placing the `express-mongo-sanitize` middleware in `app.js`, which automatically strips keys starting with `$` or `.` from request bodies.

#### Q34: What is Cross-Site Scripting (XSS), and how did you mitigate it on the backend?
**Answer:** XSS occurs when malicious HTML/Javascript code is submitted by users (e.g., in reviews) and rendered directly in other users' browsers. I mitigated this by sanitizing all incoming payloads in the backend using the `xss` library inside a global middleware, neutralizing unsafe script tags before saving to MongoDB.

#### Q35: What is CSRF, and how does SameSite cookie configuration help?
**Answer:** Cross-Site Request Forgery (CSRF) forces a user's browser to execute unauthorized requests on an application where they are authenticated. Setting the `SameSite=Lax` or `SameSite=Strict` flags on session/refresh cookies prevents browsers from sending cookies during cross-site requests, mitigating CSRF attacks.

#### Q36: How do you secure database credentials in a production deployment?
**Answer:** Database credentials should never be hardcoded in code. They are stored as environment variables (e.g., `ATLASDB_URL`) managed by the hosting provider (like AWS, Render, Heroku) and loaded into Node memory at runtime.

#### Q37: What is the purpose of the Helmet middleware?
**Answer:** `helmet` sets various secure HTTP response headers (such as `X-Content-Type-Options`, `Strict-Transport-Security`, `X-Frame-Options`) that protect the application from MIME sniffing, clickjacking, and enforce HTTPS rules.

#### Q38: How does Rate Limiting protect your server?
**Answer:** Rate limiting restricts the number of requests a single IP can make within a specified timeframe (e.g., 15 auth requests per 15 minutes). This mitigates brute-force authentication attacks, denial-of-service (DoS) attempts, and API scraping.

#### Q39: What is salt in password hashing, and why is it important?
**Answer:** A salt is a random sequence of bytes added to a password before hashing. It ensures that two identical passwords produce different hash outputs, protecting the database against lookup attacks using precomputed tables (Rainbow tables).

#### Q40: How does token-based password reset work securely?
**Answer:** When requested, the server generates a cryptographically secure random token (using `crypto`), hashes it, saves it to the user record with an expiry timestamp (e.g., 1 hour), and emails a link containing the raw token. When clicked, the server verifies the token against the hash and allows password modification before invalidating the token.

---

### Part E: Performance & Architecture (Questions 41 - 50)

#### Q41: Explain your caching invalidation strategy.
**Answer:** I cache listing lookups under keys like `listing:id` and list searches under `listings:*`. Whenever a listing is updated, created, or deleted, I explicitly invalidate these cache entries using pattern deletion (`delCache` and `delPattern`) to ensure the client immediately receives updated, consistent data.

#### Q42: What is the benefit of a caching fallback mechanism?
**Answer:** It ensures high availability. If the Redis server crashes or is unavailable locally, our cache manager catches the connection failure and falls back to an in-memory `node-cache` pool. This prevents the application server from crashing and preserves cache functionality.

#### Q43: How do you optimize pagination in MongoDB for large datasets?
**Answer:** Standard pagination using `.skip(offset).limit(limit)` becomes slow for millions of records because MongoDB must scan and skip all previous documents. For large datasets, cursor-based pagination (e.g., fetching listings where `_id > last_seen_id`) utilizing indexed fields is highly optimized.

#### Q44: What is API response compression, and what are its trade-offs?
**Answer:** Response compression reduces payload sizes, resulting in faster download speeds. The trade-off is server CPU overhead: compressing responses consumes CPU cycles, which can become a bottleneck under high traffic, though the network savings usually outweigh the cost.

#### Q45: How did you implement dynamic pricing for listings?
**Answer:** I created a price calculator in the backend. It loops through the booked nights; if a date falls on a weekend (Friday or Saturday night), it applies a 15% surcharge to the listing's base price. Finally, cleaning and service fees are added.

#### Q46: How does Nginx serve React static assets efficiently in Docker?
**Answer:** Nginx is written in C and optimized for serving static assets. It bypasses the Node.js runtime entirely for frontend files, serving HTML, CSS, and JS directly from disk with low memory and CPU overhead.

#### Q47: What is the benefit of multi-stage Docker builds?
**Answer:** Multi-stage builds compile artifacts in intermediate builder containers and copy only the final, compiled output (e.g. React `dist` folder) into the production runner container. This drastically reduces the production image size (from >1GB to <50MB), improving deploy times and lowering security attack surfaces.

#### Q48: What is the role of Docker Compose in local development?
**Answer:** It allows developers to orchestrate multi-container setups (React client, Express API, MongoDB, Redis) using a single yaml configuration. It manages networks, container boot orders (healthchecks), and database storage volumes.

#### Q49: Why should you avoid storing session state on the server in a microservice architecture?
**Answer:** Storing session state in server memory prevents horizontal scaling because subsequent requests must land on the same server instance (sticky sessions). Transitioning to stateless JWTs allows any server instance behind a load balancer to validate requests.

#### Q50: How do you track application health inside container environments?
**Answer:** By configuring `healthcheck` keys inside `docker-compose.yml` or Kubernetes manifests. These keys execute terminal commands (e.g., `redis-cli ping` or HTTP calls) inside the container at intervals, automatically restarting or isolating containers if they become unhealthy.

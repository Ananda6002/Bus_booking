# SmartBus — Vertical Slice (Auth → Search → Booking)

A real, working slice of a MERN bus-booking platform: register/login, search buses,
pick seats on a live seat map with real backend locking, enter passenger details,
apply a coupon, pay (mock), get a PNR + QR e-ticket, view booking history, and cancel
with a tiered refund calculation. Everything here talks to a real Express API and
MongoDB — nothing is faked in the frontend.

## What's included

**Backend** (`/backend`) — Node.js + Express + MongoDB/Mongoose
- JWT auth (bcrypt-hashed passwords), role field on User (`passenger` now; `operator`/`admin` ready to extend)
- Trip search with filters (city, date, price, bus type) and sorting
- Real seat locking: 5-minute TTL locks, atomic upsert to prevent two users grabbing the same seat, automatic rollback on partial failure
- Server-side fare calculation (base fare, 5% tax, convenience fee, coupon discount) — the API never trusts a price the client sends
- Coupon validation (flat/percentage, min amount, expiry, usage cap)
- Booking creation → PNR generation → QR code generation
- Cancellation with tiered refund (80% >24h, 50% 12–24h, 0% <12h before departure)
- Centralized error handling, seed script with realistic Indian cities/routes/buses/trips/coupons

**Frontend** (`/frontend`) — React 18 + Vite + React Router
- Original design system: deep-indigo hero, amber accent, "ticket-stub" card motif reused across bus results and the e-ticket
- Pages: Home (hero + search), Login, Register, Search Results (filters/sort), Booking Flow (seat map → lock countdown → passenger details → coupon → mock payment), Booking Confirmation (QR e-ticket, cancel), My Bookings

## Running it locally

You'll need Node.js 18+ and a MongoDB instance (local `mongod`, or a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster — Atlas is the easier path if you
don't already have MongoDB installed).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env — set MONGO_URI to your MongoDB connection string,
# and set JWT_SECRET to any long random string
npm run seed   # populates buses, routes, trips, coupons + a demo login
npm run dev    # starts the API on http://localhost:5000
```

Demo login created by the seed script: `demo@smartbus.in` / `password123`

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env   # defaults already point at http://localhost:5000/api
npm run dev             # starts the app on http://localhost:5173
```

Open http://localhost:5173, search **Mangaluru → Bengaluru** for any date in the
next 7 days (that's what the seed script populates), pick seats, and walk through
the full booking flow.

### 3. Try the concurrency handling

Open the same trip's seat map in two browser tabs (logged in as two different users),
select the same seat in both, and try to continue in both at once — only one will
succeed; the other gets a clear "seat is currently locked" error. This is enforced by
a unique MongoDB index in `SeatLock`, not by frontend state.

## Project structure

```
backend/
  config/       MongoDB connection
  controllers/  auth, trips, seat locking, bookings, coupons
  middleware/   JWT auth + role guard, centralized error handler
  models/       User, Bus, Route, Trip, SeatLock, Booking, Coupon
  routes/       REST route definitions
  utils/        PNR generator, fare calculator, seed script
  server.js

frontend/
  src/
    components/  Navbar, ProtectedRoute, BusCard, SeatMap
    context/     AuthContext
    pages/       Home, Login, Register, SearchResults, BookingFlow,
                 BookingConfirmation, MyBookings
    services/    axios instance
    index.css    design system
```

## What's next (not in this slice yet)

This is Phase 1 of the full spec — the end-to-end passenger journey only. Still to build:
- **Operator flow**: operator registration/verification, bus & trip management, operator dashboard with revenue/occupancy charts
- **Admin flow**: user/operator/bus/route/coupon management, platform-wide analytics dashboard
- **Real payment gateway**: swap the mock-payment step for actual Razorpay order creation + signature verification
- **Reviews & ratings**, **notifications**
- Production polish: rate limiting, request validation middleware (`express-validator` is already a dependency), skeleton loaders, toast notifications, image upload for bus photos

Say the word and I'll build the next phase (operator management + operator dashboard is
the natural next step, since admin approval of operators depends on it) the same way —
real backend, real frontend, wired together.

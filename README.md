# SmartBus — Full-Stack MERN Bus Booking Platform

A real, working MERN bus-booking platform: register/login, search buses, pick seats on a realistic bus cabin seat map with live backend locking, enter passenger details, apply a coupon, pay (mock), get a PNR + secure QR e-ticket, view booking history, and cancel with a tiered refund calculation. Everything here talks to a real Express API and MongoDB — nothing is faked on the frontend.

## What's included

**Backend** (`/backend`) — Node.js + Express + MongoDB/Mongoose
- **JWT Auth**: secure bcrypt-hashed passwords, role field on User
- **Trip Search**: trip search with filters (city, date, price, bus type) and sorting
- **Seat Locking & Concurrency**: 5-minute TTL locks, atomic upsert to prevent double booking, automatic rollback on partial failure
- **Secure Ticket Verification**: Public route to retrieve ticket details for QR scans securely
- **Server-side Calculations**: Server-side fare calculation and coupon validation
- **Cancellation**: tiered refund calculation

**Frontend** (`/frontend`) — React 18 + Vite + React Router
- **Original Design System**: deep-indigo hero, amber accent, "ticket-stub" card motifs
- **Realistic Bus Cabin Map**: Redesigned vertical bus seat map showing driver steering wheel on the **RIGHT** side, passenger entrance/exit door on the **LEFT** side, and a central aisle.
- **Dynamic Seat Selection Enforcements**:
  - Direct passenger count selector (+/- buttons) in the seat selection sidebar.
  - Dynamically limits selectable seats to the selected passenger count.
  - Warns: `"You can select only N seats for N passengers."` if selecting more.
  - Automatically slices selected seats to match the count if changed during selection.
- **Dynamic Client-Side QR Codes**:
  - Dynamically generates the QR code URL on the client-side using `VITE_FRONTEND_URL`.
  - Encodes the public verified route: `${VITE_FRONTEND_URL}/ticket/${bookingId}`.
- **Public Verified Ticket View**: New `/ticket/:bookingId` public route visualizes verified e-tickets directly from QR scans.
- **Vercel SPA Compatibility**: Integrated `vercel.json` SPA routing rewrite rules.

---

## Running it locally

### 1. Backend

```bash
cd backend
npm install
npm run seed   # populates buses, routes, trips, coupons + a demo login
npm run dev    # starts the API on http://localhost:5000
```

Demo login created by the seed script: `demo@smartbus.in` / `password123`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev    # starts the app on http://localhost:5173
```

Open http://localhost:5173, search **Mangaluru → Bengaluru** for any date in the next 7 days, pick seats, and walk through the full booking flow.

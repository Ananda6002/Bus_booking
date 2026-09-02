# SmartBus — Full-Stack MERN Bus Booking Platform

> **Note**: This project was built primarily for portfolio demonstration and skill assessment purposes to showcase end-to-end full-stack web development capabilities (Node.js, Express, MongoDB, React, seat concurrency locking, and responsive UI design). It is not intended as a live production service, though further enhancements and features are planned for future updates.

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
  - Dynamically limits selectable seats (up to 10 seats per booking).
  - Prevents selection and displays: `"You can select a maximum of 10 seats per booking."`
- **Dynamic Client-Side QR Codes**:
  - Dynamically generates the QR code URL on the client-side using `VITE_FRONTEND_URL`.
  - Encodes the public verified route: `${VITE_FRONTEND_URL}/ticket/${bookingId}`.
- **Public Verified Ticket View**: `/ticket/:bookingId` public route visualizes verified e-tickets directly from QR scans.
- **Mobile Responsive Design**: Touch-friendly mobile layout, toggleable filter panels, and responsive grid layouts.

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

---

## 🚀 Future Improvements & Roadmap
- [ ] Integration with live payment gateways (Razorpay / Stripe)
- [ ] Real-time bus tracking via GPS APIs
- [ ] Automated Email & SMS e-ticket notifications
- [ ] Operator admin dashboard for fleet management and trip scheduling

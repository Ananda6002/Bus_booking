const QRCode = require("qrcode");
const Trip = require("../models/Trip");
const SeatLock = require("../models/SeatLock");
const Booking = require("../models/Booking");
const Coupon = require("../models/Coupon");
const generatePNR = require("../utils/generatePNR");
const { calculateFare } = require("../utils/fareCalculator");

// POST /api/bookings
// Body: { tripId, passengers: [{name, age, gender, seatNumber}], contactEmail, contactPhone,
//         boardingPoint, droppingPoint, couponCode, paymentMethod }
//
// This endpoint is the single source of truth for price: it ignores any amount the client
// might send and recomputes everything from the Trip's basePrice + the actual seat count.
const createBooking = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { tripId, passengers, contactEmail, contactPhone, boardingPoint, droppingPoint, couponCode } = req.body;

    if (!tripId || !Array.isArray(passengers) || passengers.length === 0) {
      return res.status(400).json({ message: "tripId and at least one passenger are required" });
    }
    if (passengers.length > 10) {
      return res.status(400).json({ message: "You can select a maximum of 10 seats per booking" });
    }
    if (!contactEmail || !contactPhone || !boardingPoint || !droppingPoint) {
      return res.status(400).json({ message: "Contact details, boarding and dropping points are required" });
    }
    for (const p of passengers) {
      if (!p.name || !p.age || !p.gender || !p.seatNumber) {
        return res.status(400).json({ message: "Every passenger needs name, age, gender and seatNumber" });
      }
    }

    const trip = await Trip.findById(tripId).populate("bus").populate("route");
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    if (trip.status !== "scheduled") {
      return res.status(400).json({ message: "This trip is no longer available for booking" });
    }

    const seatNumbers = passengers.map((p) => p.seatNumber);

    // Verify every requested seat is (a) not already booked, and (b) currently locked by THIS user.
    const alreadyBooked = seatNumbers.filter((s) => trip.bookedSeats.includes(s));
    if (alreadyBooked.length > 0) {
      return res.status(409).json({ message: `Seat(s) already booked: ${alreadyBooked.join(", ")}` });
    }

    const now = new Date();
    const myLocks = await SeatLock.find({
      trip: tripId,
      seatNumber: { $in: seatNumbers },
      lockedBy: userId,
      expiresAt: { $gt: now },
    });
    const myLockedSeats = new Set(myLocks.map((l) => l.seatNumber));
    const notLocked = seatNumbers.filter((s) => !myLockedSeats.has(s));
    if (notLocked.length > 0) {
      return res.status(409).json({
        message: `Seat lock missing or expired for: ${notLocked.join(", ")}. Please reselect your seats.`,
      });
    }

    // Server-side fare recalculation - never trust client-sent amounts.
    const fareResult = await calculateFare({
      basePricePerSeat: trip.basePrice,
      seatCount: seatNumbers.length,
      couponCode,
    });

    const pnr = generatePNR();

    const booking = await Booking.create({
      pnr,
      user: userId,
      trip: tripId,
      passengers,
      contactEmail,
      contactPhone,
      boardingPoint,
      droppingPoint,
      fare: {
        baseFare: fareResult.baseFare,
        taxes: fareResult.taxes,
        convenienceFee: fareResult.convenienceFee,
        discount: fareResult.discount,
        totalAmount: fareResult.totalAmount,
      },
      couponCode: fareResult.appliedCoupon ? fareResult.appliedCoupon.code : undefined,
      // NOTE: real payment gateway verification happens before this controller runs
      // (POST /api/payments/verify) in the full build; this vertical slice marks it
      // paid immediately after a mock-payment success signal from the client.
      paymentStatus: "paid",
      bookingStatus: "confirmed",
    });

    // Commit: move seats from "locked" to permanently "booked" on the trip, then clear locks.
    trip.bookedSeats.push(...seatNumbers);
    await trip.save();
    await SeatLock.deleteMany({ trip: tripId, seatNumber: { $in: seatNumbers }, lockedBy: userId });

    if (fareResult.appliedCoupon) {
      await Coupon.updateOne({ _id: fareResult.appliedCoupon._id }, { $inc: { usedCount: 1 } });
    }

    const clientUrl = process.env.VITE_FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173";
    const qrPayload = `${clientUrl}/ticket/${booking._id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload);

    res.status(201).json({
      message: "Booking confirmed",
      booking,
      trip: { fromCity: trip.route.fromCity, toCity: trip.route.toCity, busName: trip.bus.busName },
      qrCodeDataUrl,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings — current user's bookings
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({ path: "trip", populate: [{ path: "bus" }, { path: "route" }] })
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/:id
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: "trip",
      populate: [{ path: "bus" }, { path: "route" }],
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this booking" });
    }

    const clientUrl = process.env.VITE_FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173";
    const qrPayload = `${clientUrl}/ticket/${booking._id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload);

    res.json({ booking, qrCodeDataUrl });
  } catch (err) {
    next(err);
  }
};

// POST /api/bookings/:id/cancel
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("trip");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }
    if (booking.bookingStatus === "cancelled") {
      return res.status(400).json({ message: "This booking is already cancelled" });
    }

    const trip = booking.trip;
    const [depHour, depMin] = trip.departureTime.split(":").map(Number);
    const departureDateTime = new Date(trip.journeyDate);
    departureDateTime.setUTCHours(depHour, depMin, 0, 0);

    const now = new Date();
    if (now >= departureDateTime) {
      return res.status(400).json({ message: "Cannot cancel a booking after departure" });
    }

    const hoursUntilDeparture = (departureDateTime - now) / (1000 * 60 * 60);
    const totalAmount = booking.fare.totalAmount;

    let refundPercent;
    if (hoursUntilDeparture > 24) refundPercent = 0.8;
    else if (hoursUntilDeparture >= 12) refundPercent = 0.5;
    else refundPercent = 0;

    const refundAmount = Math.round(totalAmount * refundPercent);
    const cancellationFee = totalAmount - refundAmount;

    booking.bookingStatus = "cancelled";
    booking.paymentStatus = refundAmount > 0 ? "refunded" : booking.paymentStatus;
    booking.cancellation = {
      cancelledAt: now,
      refundAmount,
      cancellationFee,
      refundStatus: refundAmount > 0 ? "pending" : "not_applicable",
    };
    await booking.save();

    // Free up the seats on the trip for other passengers.
    const seatNumbers = booking.passengers.map((p) => p.seatNumber);
    await Trip.updateOne({ _id: trip._id }, { $pull: { bookedSeats: { $in: seatNumbers } } });

    res.json({
      message: "Booking cancelled",
      originalAmount: totalAmount,
      cancellationFee,
      refundAmount,
      refundStatus: booking.cancellation.refundStatus,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/ticket/:id (Public Verification route)
const getPublicTicket = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: "trip",
      populate: [{ path: "bus" }, { path: "route" }],
    });
    if (!booking) {
      return res.status(404).json({ message: "Ticket not found or invalid QR code." });
    }

    const clientUrl = process.env.VITE_FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173";
    const qrPayload = `${clientUrl}/ticket/${booking._id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload);

    res.json({ booking, qrCodeDataUrl });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(404).json({ message: "Ticket not found or invalid QR code." });
    }
    next(err);
  }
};

module.exports = { createBooking, getMyBookings, getBookingById, cancelBooking, getPublicTicket };

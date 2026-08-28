const express = require("express");
const { createBooking, getMyBookings, getBookingById, cancelBooking, getPublicTicket } = require("../controllers/bookingController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/", protect, getMyBookings);
router.get("/ticket/:id", getPublicTicket);
router.get("/:id", protect, getBookingById);
router.post("/:id/cancel", protect, cancelBooking);

module.exports = router;

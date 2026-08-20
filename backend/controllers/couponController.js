const { calculateFare } = require("../utils/fareCalculator");
const Trip = require("../models/Trip");

// POST /api/coupons/validate  { tripId, seatCount, couponCode }
// Lets the frontend show the discount preview before booking, using the same
// server-side logic that will run again (authoritatively) at actual booking time.
const validateCoupon = async (req, res, next) => {
  try {
    const { tripId, seatCount, couponCode } = req.body;
    if (!tripId || !seatCount || !couponCode) {
      return res.status(400).json({ message: "tripId, seatCount and couponCode are required" });
    }
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    const fareResult = await calculateFare({
      basePricePerSeat: trip.basePrice,
      seatCount,
      couponCode,
    });

    res.json({
      valid: true,
      discount: fareResult.discount,
      totalAmount: fareResult.totalAmount,
    });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ valid: false, message: err.message });
    next(err);
  }
};

module.exports = { validateCoupon };

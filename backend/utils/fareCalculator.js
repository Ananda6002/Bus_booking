const Coupon = require("../models/Coupon");

const TAX_RATE = 0.05; // 5% tax on base fare
const CONVENIENCE_FEE_PER_SEAT = 15;

/**
 * Recalculates the full fare breakdown on the server. Never trust a price sent
 * by the client - basePrice always comes from the Trip document, seatCount
 * always comes from the actual number of seats being booked.
 */
async function calculateFare({ basePricePerSeat, seatCount, couponCode }) {
  const baseFare = basePricePerSeat * seatCount;
  const taxes = Math.round(baseFare * TAX_RATE);
  const convenienceFee = CONVENIENCE_FEE_PER_SEAT * seatCount;

  let discount = 0;
  let appliedCoupon = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (!coupon) {
      throw Object.assign(new Error("Invalid or inactive coupon code"), { statusCode: 400 });
    }
    if (coupon.expiryDate < new Date()) {
      throw Object.assign(new Error("This coupon has expired"), { statusCode: 400 });
    }
    if (coupon.usedCount >= coupon.usageLimit) {
      throw Object.assign(new Error("This coupon has reached its usage limit"), { statusCode: 400 });
    }
    if (baseFare < coupon.minBookingAmount) {
      throw Object.assign(
        new Error(`Minimum booking amount of ₹${coupon.minBookingAmount} required for this coupon`),
        { statusCode: 400 }
      );
    }

    if (coupon.discountType === "flat") {
      discount = coupon.discountValue;
    } else if (coupon.discountType === "percentage") {
      discount = Math.round((baseFare * coupon.discountValue) / 100);
    }
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    discount = Math.min(discount, baseFare); // never discount more than the base fare

    appliedCoupon = coupon;
  }

  const totalAmount = Math.max(baseFare + taxes + convenienceFee - discount, 0);

  return {
    baseFare,
    taxes,
    convenienceFee,
    discount,
    totalAmount,
    appliedCoupon,
  };
}

module.exports = { calculateFare, TAX_RATE, CONVENIENCE_FEE_PER_SEAT };

const mongoose = require("mongoose");

const passengerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true, min: 1, max: 120 },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    seatNumber: { type: String, required: true },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    pnr: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
    passengers: [passengerSchema],
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    boardingPoint: { type: String, required: true },
    droppingPoint: { type: String, required: true },
    fare: {
      baseFare: { type: Number, required: true },
      taxes: { type: Number, required: true },
      convenienceFee: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
    },
    couponCode: { type: String },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded", "partially_refunded"], default: "pending" },
    paymentId: { type: String },
    bookingStatus: { type: String, enum: ["confirmed", "cancelled", "completed"], default: "confirmed" },
    cancellation: {
      cancelledAt: { type: Date },
      refundAmount: { type: Number },
      cancellationFee: { type: Number },
      refundStatus: { type: String, enum: ["not_applicable", "pending", "processed"], default: "not_applicable" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);

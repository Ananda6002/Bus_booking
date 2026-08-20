const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    bus: { type: mongoose.Schema.Types.ObjectId, ref: "Bus", required: true },
    route: { type: mongoose.Schema.Types.ObjectId, ref: "Route", required: true },
    journeyDate: { type: Date, required: true }, // date-only, stored at midnight UTC
    departureTime: { type: String, required: true }, // "19:30"
    arrivalTime: { type: String, required: true }, // "06:00" (next day, display handled by frontend)
    durationMinutes: { type: Number, required: true },
    basePrice: { type: Number, required: true },
    bookedSeats: [{ type: String }], // seat labels already confirmed-booked for this trip
    status: { type: String, enum: ["scheduled", "cancelled", "completed"], default: "scheduled" },
  },
  { timestamps: true }
);

tripSchema.index({ journeyDate: 1 });
tripSchema.index({ route: 1, journeyDate: 1 });

module.exports = mongoose.model("Trip", tripSchema);

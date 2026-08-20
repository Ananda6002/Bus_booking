const mongoose = require("mongoose");

const busSchema = new mongoose.Schema(
  {
    operatorName: { type: String, required: true },
    busName: { type: String, required: true },
    busNumber: { type: String, required: true, unique: true },
    busType: {
      type: String,
      enum: ["AC Seater", "AC Sleeper", "Non-AC Seater", "Non-AC Sleeper", "AC Semi-Sleeper"],
      required: true,
    },
    totalSeats: { type: Number, required: true },
    // Simple layout: rows of seat labels, "" = aisle gap
    seatLayout: {
      rows: { type: Number, default: 6 },
      seatsPerRow: [{ type: [String] }], // e.g. [["A1","A2","","A3","A4"], ...]
    },
    amenities: [{ type: String }],
    rating: { type: Number, default: 4.2, min: 0, max: 5 },
    images: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bus", busSchema);

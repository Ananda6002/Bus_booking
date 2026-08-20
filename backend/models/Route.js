const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema(
  {
    fromCity: { type: String, required: true, trim: true },
    toCity: { type: String, required: true, trim: true },
    distanceKm: { type: Number, required: true },
    boardingPoints: [
      {
        name: { type: String, required: true },
        time: { type: String, required: true }, // HH:mm offset from departure, display only
      },
    ],
    droppingPoints: [
      {
        name: { type: String, required: true },
        time: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

routeSchema.index({ fromCity: 1, toCity: 1 });

module.exports = mongoose.model("Route", routeSchema);

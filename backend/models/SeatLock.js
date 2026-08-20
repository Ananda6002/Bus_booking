const mongoose = require("mongoose");

const seatLockSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
  seatNumber: { type: String, required: true },
  lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  // TTL: MongoDB will auto-delete the document once expiresAt is reached
  expiresAt: { type: Date, required: true, expires: 0 },
});

// Unique compound index: only one active lock per (trip, seatNumber) can exist at a time.
// Because expired docs are removed by the TTL monitor (runs ~every 60s), the app-level
// booking/lock controllers ALSO check expiresAt > now defensively instead of relying on
// TTL deletion timing alone.
seatLockSchema.index({ trip: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model("SeatLock", seatLockSchema);

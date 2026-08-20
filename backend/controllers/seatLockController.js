const mongoose = require("mongoose");
const Trip = require("../models/Trip");
const SeatLock = require("../models/SeatLock");

const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// POST /api/seats/lock  { tripId, seatNumbers: [] }
// Locks each requested seat individually and atomically. If ANY seat in the
// request is unavailable (booked, or locked by someone else with a live lock),
// the whole request fails and any seats it *did* manage to lock in this same
// call are rolled back - so a user never ends up with a partial selection.
const lockSeats = async (req, res, next) => {
  try {
    const { tripId, seatNumbers } = req.body;
    const userId = req.user._id;

    if (!tripId || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({ message: "tripId and a non-empty seatNumbers array are required" });
    }
    if (seatNumbers.length > 6) {
      return res.status(400).json({ message: "You can book a maximum of 6 seats at a time" });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    const alreadyBooked = seatNumbers.filter((s) => trip.bookedSeats.includes(s));
    if (alreadyBooked.length > 0) {
      return res.status(409).json({ message: `Seat(s) already booked: ${alreadyBooked.join(", ")}` });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + LOCK_DURATION_MS);
    const lockedSuccessfully = [];

    try {
      for (const seatNumber of seatNumbers) {
        // Release any of the CURRENT user's own expired lock on this seat first (defensive,
        // in case the TTL monitor hasn't swept it yet), then try to atomically claim it.
        await SeatLock.deleteMany({ trip: tripId, seatNumber, expiresAt: { $lte: now } });

        try {
          const lock = await SeatLock.findOneAndUpdate(
            { trip: tripId, seatNumber },
            { $setOnInsert: { lockedBy: userId, createdAt: now, expiresAt } },
            {
              upsert: true,
              new: false,
              includeResultMetadata: true,
            }
          );

          // If a document already existed (lock.value !== null) and it's not this user's,
          // the seat is genuinely taken by someone else right now.
          if (lock.value && lock.value.lockedBy.toString() !== userId.toString()) {
            throw Object.assign(new Error(`Seat ${seatNumber} is currently locked by another user`), {
              statusCode: 409,
            });
          }
          // If the existing lock is this same user's (e.g. re-selecting), refresh its expiry.
          if (lock.value && lock.value.lockedBy.toString() === userId.toString()) {
            await SeatLock.updateOne({ _id: lock.value._id }, { $set: { expiresAt } });
          }
          lockedSuccessfully.push(seatNumber);
        } catch (innerErr) {
          if (innerErr.code === 11000) {
            // Unique index collision = someone else grabbed it in the same instant.
            throw Object.assign(new Error(`Seat ${seatNumber} was just taken by another user`), {
              statusCode: 409,
            });
          }
          throw innerErr;
        }
      }
    } catch (lockErr) {
      // Roll back only the locks THIS call created, and only if they belong to this user.
      await SeatLock.deleteMany({ trip: tripId, seatNumber: { $in: lockedSuccessfully }, lockedBy: userId });
      return res.status(lockErr.statusCode || 409).json({ message: lockErr.message });
    }

    res.json({
      message: "Seats locked successfully",
      lockedSeats: seatNumbers,
      expiresAt,
      lockDurationSeconds: LOCK_DURATION_MS / 1000,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/seats/release  { tripId, seatNumbers: [] }
const releaseSeats = async (req, res, next) => {
  try {
    const { tripId, seatNumbers } = req.body;
    const userId = req.user._id;
    if (!tripId || !Array.isArray(seatNumbers)) {
      return res.status(400).json({ message: "tripId and seatNumbers are required" });
    }
    await SeatLock.deleteMany({ trip: tripId, seatNumber: { $in: seatNumbers }, lockedBy: userId });
    res.json({ message: "Seats released" });
  } catch (err) {
    next(err);
  }
};

module.exports = { lockSeats, releaseSeats, LOCK_DURATION_MS };

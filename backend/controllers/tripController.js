const Trip = require("../models/Trip");
const Route = require("../models/Route");
const SeatLock = require("../models/SeatLock");

// GET /api/trips/search?from=&to=&date=&sortBy=&busType=&minPrice=&maxPrice=
const searchTrips = async (req, res, next) => {
  try {
    const { from, to, date, sortBy, busType, minPrice, maxPrice } = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({ message: "from, to and date are required" });
    }

    const routes = await Route.find({
      fromCity: new RegExp(`^${from}$`, "i"),
      toCity: new RegExp(`^${to}$`, "i"),
    });
    if (routes.length === 0) return res.json({ trips: [] });

    const routeIds = routes.map((r) => r._id);

    const dayStart = new Date(date);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const query = {
      route: { $in: routeIds },
      journeyDate: { $gte: dayStart, $lt: dayEnd },
      status: "scheduled",
    };
    if (minPrice) query.basePrice = { ...query.basePrice, $gte: Number(minPrice) };
    if (maxPrice) query.basePrice = { ...query.basePrice, $lte: Number(maxPrice) };

    let trips = await Trip.find(query).populate("bus").populate("route");

    if (busType) {
      trips = trips.filter((t) => t.bus.busType === busType);
    }

    let results = trips.map((t) => {
      const availableSeats = t.bus.totalSeats - t.bookedSeats.length;
      return {
        tripId: t._id,
        operatorName: t.bus.operatorName,
        busName: t.bus.busName,
        busType: t.bus.busType,
        rating: t.bus.rating,
        amenities: t.bus.amenities,
        fromCity: t.route.fromCity,
        toCity: t.route.toCity,
        departureTime: t.departureTime,
        arrivalTime: t.arrivalTime,
        durationMinutes: t.durationMinutes,
        price: t.basePrice,
        availableSeats,
        journeyDate: t.journeyDate,
      };
    });

    if (sortBy === "price_low") results.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_high") results.sort((a, b) => b.price - a.price);
    else if (sortBy === "earliest") results.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    else if (sortBy === "rating") results.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "duration") results.sort((a, b) => a.durationMinutes - b.durationMinutes);

    res.json({ trips: results });
  } catch (err) {
    next(err);
  }
};

// GET /api/trips/:id
const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id).populate("bus").populate("route");
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    res.json({ trip });
  } catch (err) {
    next(err);
  }
};

// GET /api/trips/:id/seats — returns every seat with its current status
const getTripSeats = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id).populate("bus");
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    const now = new Date();
    const activeLocks = await SeatLock.find({ trip: trip._id, expiresAt: { $gt: now } });
    const lockedMap = {};
    activeLocks.forEach((lock) => {
      lockedMap[lock.seatNumber] = lock.lockedBy.toString();
    });

    const bookedSet = new Set(trip.bookedSeats);
    const currentUserId = req.user ? req.user._id.toString() : null;

    const seatLayout = trip.bus.seatLayout.seatsPerRow.map((row) =>
      row.map((seatLabel) => {
        if (!seatLabel) return { seatNumber: "", status: "gap" };
        let status = "available";
        if (bookedSet.has(seatLabel)) status = "booked";
        else if (lockedMap[seatLabel]) {
          status = lockedMap[seatLabel] === currentUserId ? "locked_by_you" : "locked";
        }
        return { seatNumber: seatLabel, status };
      })
    );

    res.json({
      tripId: trip._id,
      busType: trip.bus.busType,
      totalSeats: trip.bus.totalSeats,
      price: trip.basePrice,
      seatLayout,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { searchTrips, getTripById, getTripSeats };

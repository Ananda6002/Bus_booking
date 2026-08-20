const express = require("express");
const { searchTrips, getTripById, getTripSeats } = require("../controllers/tripController");
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/search", searchTrips);
router.get("/:id", getTripById);
router.get("/:id/seats", optionalAuth, getTripSeats);

module.exports = router;

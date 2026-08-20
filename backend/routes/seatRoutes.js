const express = require("express");
const { lockSeats, releaseSeats } = require("../controllers/seatLockController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/lock", protect, lockSeats);
router.post("/release", protect, releaseSeats);

module.exports = router;

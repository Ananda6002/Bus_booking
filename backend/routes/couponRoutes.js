const express = require("express");
const { validateCoupon } = require("../controllers/couponController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/validate", protect, validateCoupon);

module.exports = router;

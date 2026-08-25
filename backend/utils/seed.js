// Run with: npm run seed
// Wipes and repopulates Bus, Route, Trip and Coupon collections so the app is
// immediately usable after a fresh clone + `npm run seed`.

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Bus = require("../models/Bus");
const Route = require("../models/Route");
const Trip = require("../models/Trip");
const Coupon = require("../models/Coupon");
const User = require("../models/User");

// 40-seat bus layout: 2 seats + aisle + 2 seats
const seaterLayout = (prefix) => [
  [`${prefix}A1`, `${prefix}A2`, "", `${prefix}A3`, `${prefix}A4`],
  [`${prefix}B1`, `${prefix}B2`, "", `${prefix}B3`, `${prefix}B4`],
  [`${prefix}C1`, `${prefix}C2`, "", `${prefix}C3`, `${prefix}C4`],
  [`${prefix}D1`, `${prefix}D2`, "", `${prefix}D3`, `${prefix}D4`],
  [`${prefix}E1`, `${prefix}E2`, "", `${prefix}E3`, `${prefix}E4`],
  [`${prefix}F1`, `${prefix}F2`, "", `${prefix}F3`, `${prefix}F4`],
  [`${prefix}G1`, `${prefix}G2`, "", `${prefix}G3`, `${prefix}G4`],
  [`${prefix}H1`, `${prefix}H2`, "", `${prefix}H3`, `${prefix}H4`],
  [`${prefix}I1`, `${prefix}I2`, "", `${prefix}I3`, `${prefix}I4`],
  [`${prefix}J1`, `${prefix}J2`, "", `${prefix}J3`, `${prefix}J4`],
];

const run = async () => {
  await connectDB();

  console.log("Clearing existing data...");

  await Promise.all([
    Bus.deleteMany({}),
    Route.deleteMany({}),
    Trip.deleteMany({}),
    Coupon.deleteMany({}),
  ]);

  console.log("Seeding buses...");

  const buses = await Bus.insertMany([
    {
      operatorName: "Smart Travels",
      busName: "Smart Travels AC Sleeper",
      busNumber: "KA-19-4521",
      busType: "AC Sleeper",
      totalSeats: 40,
      seatLayout: {
        rows: 10,
        seatsPerRow: seaterLayout(""),
      },
      amenities: [
        "Wi-Fi",
        "Charging Point",
        "Water Bottle",
        "Blanket",
        "CCTV",
      ],
      rating: 4.4,
    },

    {
      operatorName: "Coastal Express",
      busName: "Coastal Express AC Seater",
      busNumber: "KA-20-7788",
      busType: "AC Seater",
      totalSeats: 40,
      seatLayout: {
        rows: 10,
        seatsPerRow: seaterLayout(""),
      },
      amenities: [
        "Wi-Fi",
        "Charging Point",
        "Reading Light",
      ],
      rating: 4.1,
    },

    {
      operatorName: "Sea Bird Travels",
      busName: "Sea Bird Non-AC Seater",
      busNumber: "KA-21-3344",
      busType: "Non-AC Seater",
      totalSeats: 40,
      seatLayout: {
        rows: 10,
        seatsPerRow: seaterLayout(""),
      },
      amenities: ["Charging Point"],
      rating: 3.8,
    },

    {
      operatorName: "Karnataka Gold Line",
      busName: "Gold Line AC Semi-Sleeper",
      busNumber: "KA-05-9911",
      busType: "AC Semi-Sleeper",
      totalSeats: 40,
      seatLayout: {
        rows: 10,
        seatsPerRow: seaterLayout(""),
      },
      amenities: [
        "Wi-Fi",
        "Charging Point",
        "Water Bottle",
      ],
      rating: 4.6,
    },
  ]);

  console.log("Seeding routes...");

  const routes = await Route.insertMany([
    {
      fromCity: "Mangaluru",
      toCity: "Bengaluru",
      distanceKm: 352,
      boardingPoints: [
        {
          name: "Mangaluru Bus Stand",
          time: "19:30",
        },
        {
          name: "Surathkal",
          time: "19:55",
        },
      ],
      droppingPoints: [
        {
          name: "Majestic, Bengaluru",
          time: "06:00",
        },
        {
          name: "Silk Board",
          time: "06:30",
        },
      ],
    },

    {
      fromCity: "Bengaluru",
      toCity: "Mangaluru",
      distanceKm: 352,
      boardingPoints: [
        {
          name: "Majestic, Bengaluru",
          time: "21:00",
        },
      ],
      droppingPoints: [
        {
          name: "Mangaluru Bus Stand",
          time: "06:30",
        },
      ],
    },

    {
      fromCity: "Mangaluru",
      toCity: "Mysuru",
      distanceKm: 250,
      boardingPoints: [
        {
          name: "Mangaluru Bus Stand",
          time: "22:00",
        },
      ],
      droppingPoints: [
        {
          name: "Mysuru Bus Stand",
          time: "05:00",
        },
      ],
    },

    {
      fromCity: "Bengaluru",
      toCity: "Chennai",
      distanceKm: 346,
      boardingPoints: [
        {
          name: "Majestic, Bengaluru",
          time: "22:30",
        },
      ],
      droppingPoints: [
        {
          name: "Koyambedu, Chennai",
          time: "05:30",
        },
      ],
    },

    {
      fromCity: "Bengaluru",
      toCity: "Hyderabad",
      distanceKm: 570,
      boardingPoints: [
        {
          name: "Majestic, Bengaluru",
          time: "18:00",
        },
      ],
      droppingPoints: [
        {
          name: "Mehdipatnam, Hyderabad",
          time: "07:00",
        },
      ],
    },
  ]);

  console.log("Seeding trips (next 7 days for each route/bus pair)...");

  const trips = [];

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const pricingByType = {
    "AC Sleeper": 1200,
    "AC Seater": 850,
    "Non-AC Seater": 550,
    "AC Semi-Sleeper": 950,
  };

  const timesByBus = [
    "19:30",
    "21:00",
    "22:00",
    "18:00",
  ];

  const durationMinutes = 630;

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const journeyDate = new Date(today);

    journeyDate.setUTCDate(
      journeyDate.getUTCDate() + dayOffset
    );

    routes.forEach((route, routeIdx) => {
      buses.forEach((bus, busIdx) => {
        const departureTime =
          timesByBus[busIdx % timesByBus.length];

        const [h, m] = departureTime
          .split(":")
          .map(Number);

        const arrivalMinutes =
          h * 60 + m + durationMinutes;

        const arrivalTime = `${String(
          Math.floor((arrivalMinutes / 60) % 24)
        ).padStart(2, "0")}:${String(
          arrivalMinutes % 60
        ).padStart(2, "0")}`;

        trips.push({
          bus: bus._id,
          route: route._id,
          journeyDate,
          departureTime,
          arrivalTime,
          durationMinutes,
          basePrice:
            pricingByType[bus.busType] +
            routeIdx * 50,
          bookedSeats: [],
          status: "scheduled",
        });
      });
    });
  }

  await Trip.insertMany(trips);

  console.log("Seeding coupons...");

  const expiry = new Date();
  expiry.setMonth(expiry.getMonth() + 3);

  await Coupon.insertMany([
    {
      code: "WELCOME100",
      discountType: "flat",
      discountValue: 100,
      minBookingAmount: 500,
      expiryDate: expiry,
      usageLimit: 1000,
      isActive: true,
    },

    {
      code: "SAVE10",
      discountType: "percentage",
      discountValue: 10,
      maxDiscount: 150,
      minBookingAmount: 300,
      expiryDate: expiry,
      usageLimit: 1000,
      isActive: true,
    },
  ]);

  console.log(
    "Seeding a demo passenger login (demo@smartbus.in / password123)..."
  );

  const existingDemo = await User.findOne({
    email: "demo@smartbus.in",
  });

  if (!existingDemo) {
    await User.create({
      fullName: "Demo Passenger",
      email: "demo@smartbus.in",
      phone: "9999999999",
      password: "password123",
      role: "passenger",
    });
  }

  console.log(
    `Done. Seeded ${buses.length} buses, ${routes.length} routes, ${trips.length} trips, 2 coupons.`
  );

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
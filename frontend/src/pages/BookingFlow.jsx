import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../services/api";
import SeatMap from "../components/SeatMap";
import { useAuth } from "../context/AuthContext";

const LOCK_SECONDS = 300;

export default function BookingFlow() {
  const { tripId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const passengerCount = Number(searchParams.get("passengers")) || 1;

  const [step, setStep] = useState(1); // 1 = seats, 2 = details & payment
  const [trip, setTrip] = useState(null);
  const [seatLayout, setSeatLayout] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locking, setLocking] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(null);

  const [boardingPoint, setBoardingPoint] = useState("");
  const [droppingPoint, setDroppingPoint] = useState("");
  const [passengers, setPassengers] = useState([]);
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [contactPhone, setContactPhone] = useState(user?.phone || "");
  const [couponCode, setCouponCode] = useState("");
  const [couponPreview, setCouponPreview] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [paying, setPaying] = useState(false);

  const loadSeats = () => {
    return api.get(`/trips/${tripId}/seats`).then((res) => {
      setSeatLayout(res.data.seatLayout);
      const lockedByMe = [];
      res.data.seatLayout.forEach((row) => {
        row.forEach((seat) => {
          if (seat.status === "locked_by_you") {
            lockedByMe.push(seat.seatNumber);
          }
        });
      });
      if (lockedByMe.length > 0) {
        setSelectedSeats(lockedByMe);
      }
    });
  };

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([api.get(`/trips/${tripId}`).then((res) => setTrip(res.data.trip)), loadSeats()])
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [tripId]);

  // Countdown for the seat lock once seats are locked (step 2)
  useEffect(() => {
    if (step !== 2 || secondsLeft === null) return;
    if (secondsLeft <= 0) {
      setError("Your seat lock expired. Please reselect your seats.");
      setStep(1);
      loadSeats();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, secondsLeft]);

  const toggleSeat = (seatNumber) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatNumber)) {
        setError("");
        return prev.filter((s) => s !== seatNumber);
      }
      if (prev.length >= passengerCount) {
        setError(`You selected ${passengerCount} passenger${passengerCount > 1 ? "s" : ""}. Maximum ${passengerCount} seat${passengerCount > 1 ? "s" : ""} can be selected.`);
        return prev;
      }
      setError("");
      return [...prev, seatNumber];
    });
  };

  const proceedToDetails = async () => {
    if (selectedSeats.length === 0) {
      setError("Please select at least one seat.");
      return;
    }
    if (selectedSeats.length !== passengerCount) {
      setError(`Please select exactly ${passengerCount} seat${passengerCount > 1 ? "s" : ""} for ${passengerCount} passenger${passengerCount > 1 ? "s" : ""}.`);
      return;
    }
    setError("");
    setLocking(true);
    try {
      const res = await api.post("/seats/lock", { tripId, seatNumbers: selectedSeats });
      setSecondsLeft(res.data.lockDurationSeconds || LOCK_SECONDS);
      setPassengers(selectedSeats.map((seatNumber) => ({ seatNumber, name: "", age: "", gender: "Male" })));
      setBoardingPoint(trip.route.boardingPoints[0]?.name || "");
      setDroppingPoint(trip.route.droppingPoints[0]?.name || "");
      setStep(2);
    } catch (err) {
      setError(err.message);
      await loadSeats();
    } finally {
      setLocking(false);
    }
  };

  const backToSeats = async () => {
    await api.post("/seats/release", { tripId, seatNumbers: selectedSeats }).catch(() => {});
    setStep(1);
    setSecondsLeft(null);
    await loadSeats();
  };

  const updatePassenger = (idx, field, value) => {
    setPassengers((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  };

  const baseFare = trip ? trip.basePrice * selectedSeats.length : 0;
  const taxes = Math.round(baseFare * 0.05);
  const convenienceFee = selectedSeats.length * 15;
  const discount = couponPreview?.discount || 0;
  const totalAmount = couponPreview?.totalAmount ?? Math.max(baseFare + taxes + convenienceFee - discount, 0);

  const applyCoupon = async () => {
    setCouponError("");
    setCouponPreview(null);
    if (!couponCode) return;
    try {
      const res = await api.post("/coupons/validate", {
        tripId,
        seatCount: selectedSeats.length,
        couponCode,
      });
      setCouponPreview(res.data);
    } catch (err) {
      setCouponError(err.message);
    }
  };

  const handlePassengerFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    for (const p of passengers) {
      if (!p.name || !p.age || !p.gender) {
        setError("Please fill in every passenger's name, age and gender");
        return;
      }
    }
    if (!contactEmail || !/^\d{10}$/.test(contactPhone)) {
      setError("Enter a valid contact email and 10-digit phone number");
      return;
    }

    setPaying(true);
    try {
      // Mock payment: in production this step creates a Razorpay order, opens the
      // checkout widget, and only calls /api/payments/verify (server-side signature
      // check) before booking is created. Here we simulate that round trip.
      await new Promise((resolve) => setTimeout(resolve, 900));

      const res = await api.post("/bookings", {
        tripId,
        passengers: passengers.map((p) => ({ ...p, age: Number(p.age) })),
        contactEmail,
        contactPhone,
        boardingPoint,
        droppingPoint,
        couponCode: couponPreview ? couponCode : undefined,
      });
      navigate(`/bookings/${res.data.booking._id}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div className="container page-section">Loading trip...</div>;
  if (error && !trip) return <div className="container page-section error-banner">{error}</div>;
  if (!trip) return null;

  return (
    <div className="container page-section">
      <h2 className="section-title">
        {trip.route.fromCity} → {trip.route.toCity}{" "}
        <span style={{ fontWeight: 400, fontSize: "1rem", color: "var(--ink-soft)" }}>
          · {trip.bus.busName} · {trip.departureTime}
        </span>
      </h2>

      {error && <div className="error-banner">{error}</div>}

      {step === 1 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
          <SeatMap seatLayout={seatLayout} selectedSeats={selectedSeats} onToggleSeat={toggleSeat} />
          <div className="card">
            <h4 style={{ marginBottom: 12 }}>Selected seats</h4>
            <div style={{ marginBottom: 16, fontSize: "0.95rem", color: "var(--ink-soft)", fontWeight: 500 }}>
              Select {passengerCount} seat{passengerCount > 1 ? "s" : ""} for {passengerCount} passenger{passengerCount > 1 ? "s" : ""}
              <div style={{ marginTop: 4, fontWeight: 700, color: selectedSeats.length === passengerCount ? "var(--green)" : "var(--amber-deep)" }}>
                ({selectedSeats.length}/{passengerCount} selected)
              </div>
            </div>
            {selectedSeats.length === 0 ? (
              <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>Tap a seat to select it.</p>
            ) : (
              <p className="mono">{selectedSeats.join(", ")}</p>
            )}
            <div className="fare-row total">
              <span>Total</span>
              <span>₹{trip.basePrice * selectedSeats.length}</span>
            </div>
            <button
              className="btn btn-primary btn-block"
              style={{ marginTop: 14 }}
              disabled={selectedSeats.length !== passengerCount || locking}
              onClick={proceedToDetails}
            >
              {locking ? "Locking seats..." : "Continue"}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
          <div>
            {secondsLeft !== null && (
              <div className="success-banner" style={{ background: "#fff4e8", color: "var(--amber-deep)" }}>
                Seats held for {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")} — complete
                your booking before the timer runs out.
              </div>
            )}
            <form className="card" onSubmit={handlePassengerFormSubmit}>
              <h4 style={{ marginBottom: 14 }}>Boarding &amp; dropping point</h4>
              <div className="form-row" style={{ marginBottom: 22 }}>
                <div className="field">
                  <label>Boarding point</label>
                  <select value={boardingPoint} onChange={(e) => setBoardingPoint(e.target.value)}>
                    {trip.route.boardingPoints.map((bp) => (
                      <option key={bp.name} value={bp.name}>
                        {bp.name} ({bp.time})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Dropping point</label>
                  <select value={droppingPoint} onChange={(e) => setDroppingPoint(e.target.value)}>
                    {trip.route.droppingPoints.map((dp) => (
                      <option key={dp.name} value={dp.name}>
                        {dp.name} ({dp.time})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <h4 style={{ marginBottom: 14 }}>Passenger details</h4>
              {passengers.map((p, idx) => (
                <div className="form-row" key={p.seatNumber} style={{ marginBottom: 12 }}>
                  <div className="field" style={{ alignSelf: "center", fontWeight: 700 }}>
                    Seat {p.seatNumber}
                  </div>
                  <div className="field">
                    <label>Name</label>
                    <input required value={p.name} onChange={(e) => updatePassenger(idx, "name", e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Age</label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      required
                      value={p.age}
                      onChange={(e) => updatePassenger(idx, "age", e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Gender</label>
                    <select value={p.gender} onChange={(e) => updatePassenger(idx, "gender", e.target.value)}>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              ))}

              <h4 style={{ margin: "22px 0 14px" }}>Contact details</h4>
              <div className="form-row" style={{ marginBottom: 8 }}>
                <div className="field">
                  <label>Email</label>
                  <input type="email" required value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                </div>
                <div className="field">
                  <label>Phone</label>
                  <input
                    required
                    pattern="\d{10}"
                    maxLength={10}
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <button type="button" className="btn btn-outline" onClick={backToSeats}>
                  Back to seats
                </button>
                <button type="submit" className="btn btn-primary" disabled={paying} style={{ flex: 1 }}>
                  {paying ? "Processing payment..." : `Pay ₹${totalAmount} & Confirm`}
                </button>
              </div>
            </form>
          </div>

          <div className="card">
            <h4 style={{ marginBottom: 12 }}>Fare summary</h4>
            <div className="fare-row">
              <span>Base fare ({selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""})</span>
              <span>₹{baseFare}</span>
            </div>
            <div className="fare-row">
              <span>Taxes</span>
              <span>₹{taxes}</span>
            </div>
            <div className="fare-row">
              <span>Convenience fee</span>
              <span>₹{convenienceFee}</span>
            </div>
            {discount > 0 && (
              <div className="fare-row" style={{ color: "var(--green)" }}>
                <span>Discount ({couponCode.toUpperCase()})</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="fare-row total">
              <span>Total</span>
              <span>₹{totalAmount}</span>
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", color: "var(--ink-soft)" }}>
                Coupon code
              </label>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="WELCOME100"
                  style={{
                    flex: 1,
                    border: "1.5px solid var(--border)",
                    borderRadius: 8,
                    padding: "10px 12px",
                  }}
                />
                <button type="button" className="btn btn-outline" onClick={applyCoupon}>
                  Apply
                </button>
              </div>
              {couponError && <p style={{ color: "var(--red)", fontSize: "0.82rem", marginTop: 6 }}>{couponError}</p>}
              {couponPreview && (
                <p style={{ color: "var(--green)", fontSize: "0.82rem", marginTop: 6 }}>
                  Coupon applied — you saved ₹{couponPreview.discount}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/bookings")
      .then((res) => setBookings(res.data.bookings))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container page-section">Loading your bookings...</div>;
  if (error) return <div className="container page-section error-banner">{error}</div>;

  return (
    <div className="container page-section">
      <h2 className="section-title">My Bookings</h2>
      {bookings.length === 0 ? (
        <div className="empty-state">
          <h3>No bookings yet</h3>
          <p>
            <Link to="/" style={{ color: "var(--amber-deep)", fontWeight: 600 }}>
              Search for a bus
            </Link>{" "}
            to make your first booking.
          </p>
        </div>
      ) : (
        bookings.map((b) => (
          <div className="card" key={b._id} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>
                  {b.trip.route.fromCity} → {b.trip.route.toCity}
                </div>
                <div style={{ color: "var(--ink-soft)", fontSize: "0.88rem", marginTop: 4 }}>
                  {b.trip.bus.operatorName} · {new Date(b.trip.journeyDate).toDateString()} · {b.trip.departureTime}
                </div>
                <div className="mono" style={{ fontSize: "0.82rem", marginTop: 6, color: "var(--ink-soft)" }}>
                  PNR {b.pnr} · Seats {b.passengers.map((p) => p.seatNumber).join(", ")}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span
                  className={`status-pill ${b.bookingStatus === "confirmed" ? "status-confirmed" : "status-cancelled"}`}
                >
                  {b.bookingStatus.toUpperCase()}
                </span>
                <div style={{ fontWeight: 700, marginTop: 8 }}>₹{b.fare.totalAmount}</div>
              </div>
            </div>
            <Link to={`/bookings/${b._id}`} className="btn btn-outline" style={{ marginTop: 14, display: "inline-flex" }}>
              View ticket
            </Link>
          </div>
        ))
      )}
    </div>
  );
}

import { useNavigate } from "react-router-dom";

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export default function BusCard({ trip }) {
  const navigate = useNavigate();

  return (
    <div className="ticket-card">
      <div className="ticket-main">
        <div className="operator-row">
          <div>
            <div className="operator-name">{trip.operatorName}</div>
            <span className="bus-type-badge">{trip.busType}</span>
          </div>
          <div className="rating-badge">★ {trip.rating.toFixed(1)}</div>
        </div>

        <div className="route-row">
          <div>
            <div className="route-time">{trip.departureTime}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--ink-soft)" }}>{trip.fromCity}</div>
          </div>
          <div className="route-line">
            <span>{formatDuration(trip.durationMinutes)}</span>
            <div className="route-line-bar" />
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="route-time">{trip.arrivalTime}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--ink-soft)" }}>{trip.toCity}</div>
          </div>
        </div>

        <div className="amenity-tags">
          {trip.amenities.slice(0, 5).map((a) => (
            <span key={a} className="amenity-tag">
              {a}
            </span>
          ))}
        </div>
      </div>

      <div className="ticket-stub">
        <div className="ticket-perforation" />
        <div className="stub-price">₹{trip.price}</div>
        <div className="stub-seats">
          {trip.availableSeats > 0 ? `${trip.availableSeats} seats left` : "Sold out"}
        </div>
        <button
          className="btn btn-primary"
          style={{ marginTop: 10, width: "100%" }}
          disabled={trip.availableSeats <= 0}
          onClick={() => navigate(`/trips/${trip.tripId}/seats`)}
        >
          View Seats
        </button>
      </div>
    </div>
  );
}

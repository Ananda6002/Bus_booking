import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import QRCode from "qrcode";

export default function TicketView() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [error, setError] = useState("");
  const [qrError, setQrError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get(`/bookings/ticket/${bookingId}`)
      .then((res) => {
        setBooking(res.data.booking);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Invalid or unavailable ticket");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [bookingId]);

  useEffect(() => {
    if (!booking) return;
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL;
    if (!frontendUrl && import.meta.env.PROD) {
      setQrError("Configuration Error: VITE_FRONTEND_URL environment variable is missing in production.");
      return;
    }
    const ticketUrl = `${frontendUrl || "http://localhost:5173"}/ticket/${booking._id}`;
    QRCode.toDataURL(ticketUrl)
      .then((url) => {
        setQrCodeDataUrl(url);
        setQrError("");
      })
      .catch((err) => setQrError("Failed to generate secure QR code: " + err.message));
  }, [booking]);

  if (loading) return <div className="container page-section">Verifying ticket details...</div>;
  
  if (error || !booking) {
    return (
      <div className="container page-section" style={{ textAlign: "center", marginTop: 40 }}>
        <div className="error-banner" style={{ display: "inline-block", maxWidth: "460px" }}>
          {error || "Invalid or unavailable ticket"}
        </div>
      </div>
    );
  }

  const { trip } = booking;

  return (
    <div className="container page-section">
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div className="status-pill status-confirmed" style={{ fontSize: "0.9rem", padding: "6px 16px" }}>
          ✓ VERIFIED TICKET
        </div>
      </div>

      <div className="eticket" style={{ maxWidth: 500, margin: "0 auto" }}>
        <div className="eticket-head">
          <div>
            <div style={{ fontSize: "0.75rem", opacity: 0.7, textTransform: "uppercase" }}>PNR</div>
            <div className="eticket-pnr">{booking.pnr}</div>
          </div>
          <span className={`status-pill ${booking.bookingStatus === "confirmed" ? "status-confirmed" : "status-cancelled"}`}>
            {booking.bookingStatus.toUpperCase()}
          </span>
        </div>

        <div className="eticket-body">
          <h3>
            {trip.route.fromCity} → {trip.route.toCity}
          </h3>
          <p style={{ color: "var(--ink-soft)", marginTop: 4 }}>
            {trip.bus.operatorName} · {trip.bus.busName} · {trip.bus.busType}
          </p>

          <div className="grid-2" style={{ marginTop: 18 }}>
            <div>
              <div className="label-sm">Journey date</div>
              <div className="value-sm">{new Date(trip.journeyDate).toDateString()}</div>
            </div>
            <div>
              <div className="label-sm">Departure — Arrival</div>
              <div className="value-sm">
                {trip.departureTime} — {trip.arrivalTime}
              </div>
            </div>
            <div>
              <div className="label-sm">Boarding point</div>
              <div className="value-sm">{booking.boardingPoint}</div>
            </div>
            <div>
              <div className="label-sm">Dropping point</div>
              <div className="value-sm">{booking.droppingPoint}</div>
            </div>
          </div>

          <div className="eticket-divider" />

          <div className="label-sm">Passengers &amp; seats</div>
          {booking.passengers.map((p) => (
            <div key={p.seatNumber} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "0.92rem" }}>
              <span>
                {p.name} ({p.age}, {p.gender})
              </span>
              <span className="mono">Seat {p.seatNumber}</span>
            </div>
          ))}

          <div className="eticket-divider" />

          <div className="fare-row">
            <span>Base fare</span>
            <span>₹{booking.fare.baseFare}</span>
          </div>
          <div className="fare-row">
            <span>Taxes</span>
            <span>₹{booking.fare.taxes}</span>
          </div>
          <div className="fare-row">
            <span>Convenience fee</span>
            <span>₹{booking.fare.convenienceFee}</span>
          </div>
          {booking.fare.discount > 0 && (
            <div className="fare-row" style={{ color: "var(--green)" }}>
              <span>Discount {booking.couponCode ? `(${booking.couponCode})` : ""}</span>
              <span>-₹{booking.fare.discount}</span>
            </div>
          )}
          <div className="fare-row total">
            <span>Total paid</span>
            <span>₹{booking.fare.totalAmount}</span>
          </div>

          {qrError && (
            <div style={{ textAlign: "center", marginTop: 24 }} className="error-banner">
              {qrError}
            </div>
          )}

          {!qrError && qrCodeDataUrl && (
            <div style={{ textAlign: "center", marginTop: 24, padding: "16px", background: "#f8fafc", borderRadius: "12px", border: "1px dashed var(--border)" }}>
              <img src={qrCodeDataUrl} alt="Ticket QR code" width={130} height={130} />
              <p style={{ fontSize: "0.76rem", color: "var(--ink-soft)", marginTop: 6, fontWeight: 500 }}>
                This is a secure, unique ticket verification QR.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

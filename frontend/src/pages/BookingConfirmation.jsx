import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import QRCode from "qrcode";

export default function BookingConfirmation() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [error, setError] = useState("");
  const [qrError, setQrError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelResult, setCancelResult] = useState(null);

  const load = () => {
    api
      .get(`/bookings/${bookingId}`)
      .then((res) => {
        setBooking(res.data.booking);
      })
      .catch((err) => setError(err.message));
  };

  useEffect(load, [bookingId]);

  useEffect(() => {
    if (!booking) return;
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL;
    if (!frontendUrl && import.meta.env.PROD) {
      setQrError("Configuration Error: VITE_FRONTEND_URL environment variable is missing in production.");
      return;
    }
    const baseUrl = frontendUrl || (typeof window !== "undefined" ? window.location.origin : "http://localhost:5173");
    const ticketUrl = `${baseUrl}/ticket/${booking._id}`;
    QRCode.toDataURL(ticketUrl)
      .then((url) => {
        setQrCodeDataUrl(url);
        setQrError("");
      })
      .catch((err) => setQrError("Failed to generate secure QR code: " + err.message));
  }, [booking]);

  const handleCancel = async () => {
    if (!confirm("Cancel this booking? Refund amount depends on how close it is to departure.")) return;
    setCancelling(true);
    try {
      const res = await api.post(`/bookings/${bookingId}/cancel`);
      setCancelResult(res.data);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  if (error) return <div className="container page-section error-banner">{error}</div>;
  if (!booking) return <div className="container page-section">Loading ticket...</div>;

  const { trip } = booking;

  return (
    <div className="container page-section">
      <div className="eticket">
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
            <div style={{ textAlign: "center", marginTop: 20 }} className="error-banner">
              {qrError}
            </div>
          )}

          {!qrError && qrCodeDataUrl && (
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <img src={qrCodeDataUrl} alt="Ticket QR code" width={140} height={140} />
              <p style={{ fontSize: "0.78rem", color: "var(--ink-soft)", marginTop: 6 }}>
                Show this QR code to the conductor at boarding
              </p>
            </div>
          )}

          {cancelResult && (
            <div className="success-banner" style={{ marginTop: 18 }}>
              Cancelled. Refund of ₹{cancelResult.refundAmount} will be processed
              {cancelResult.cancellationFee > 0 ? ` (cancellation fee: ₹${cancelResult.cancellationFee})` : ""}.
            </div>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
            <button className="btn btn-outline" onClick={() => window.print()}>
              Print / Download
            </button>
            {booking.bookingStatus === "confirmed" && (
              <button className="btn btn-danger" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? "Cancelling..." : "Cancel booking"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <Link to="/my-bookings" style={{ color: "var(--amber-deep)", fontWeight: 600 }}>
          View all my bookings →
        </Link>
      </div>
    </div>
  );
}

export default function SeatMap({ seatLayout, selectedSeats, onToggleSeat }) {
  const statusClass = (status, seatNumber) => {
    if (status === "gap") return "seat gap";
    if (status === "booked") return "seat seat-booked";
    if (status === "locked") return "seat seat-locked";
    if (selectedSeats.includes(seatNumber)) return "seat seat-selected";
    return "seat seat-available";
  };

  const handleClick = (seat) => {
    if (
      seat.status === "booked" ||
      seat.status === "locked" ||
      seat.status === "gap"
    ) {
      return;
    }

    onToggleSeat(seat.seatNumber);
  };

  return (
    <div className="seat-map-wrap">
      <div className="driver-tag">🚌 DRIVER</div>

      <div className="bus-body">
        <div className="seat-grid">
          {seatLayout.map((row, rowIdx) => (
            <div className="seat-row" key={rowIdx}>
              {row.map((seat, seatIdx) => (
                <div
                  key={seatIdx}
                  className={statusClass(seat.status, seat.seatNumber)}
                  onClick={() => handleClick(seat)}
                  title={seat.seatNumber || undefined}
                >
                  {seat.status !== "gap" ? seat.seatNumber : ""}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="seat-legend">
        <div className="legend-item">
          <span
            className="legend-swatch"
            style={{
              background: "#fff",
              border: "1.5px solid var(--gray-seat)",
            }}
          />
          Available
        </div>

        <div className="legend-item">
          <span
            className="legend-swatch"
            style={{ background: "var(--amber)" }}
          />
          Selected
        </div>

        <div className="legend-item">
          <span
            className="legend-swatch"
            style={{ background: "var(--gray-seat)" }}
          />
          Booked
        </div>

        <div className="legend-item">
          <span
            className="legend-swatch"
            style={{
              background: "var(--red-bg)",
              border: "1.5px solid var(--red)",
            }}
          />
          Locked
        </div>
      </div>
    </div>
  );
}
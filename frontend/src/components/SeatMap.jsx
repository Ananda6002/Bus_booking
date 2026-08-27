export default function SeatMap({ seatLayout, selectedSeats, onToggleSeat }) {
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
      <div className="bus-container">
        <div className="bus-door">ENTRY</div>
        
        <div className="bus-front">
          <div className="driver-area">
            <svg className="steering-wheel" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="2" x2="12" y2="22"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span className="driver-text">DRIVER</span>
          </div>
          <div className="windshield" />
        </div>

        <div className="bus-cabin">
          <div className="seat-grid">
            {seatLayout.map((row, rowIdx) => (
              <div className="seat-row" key={rowIdx}>
                {row.map((seat, seatIdx) => {
                  if (seat.status === "gap") {
                    return <div key={seatIdx} className="seat gap" />;
                  }

                  const isLocked = seat.status === "locked";
                  const isSelected = selectedSeats.includes(seat.seatNumber) || seat.status === "locked_by_you";
                  const isBooked = seat.status === "booked";

                  let statusClass = "seat seat-available";
                  if (isBooked) statusClass = "seat seat-booked";
                  else if (isLocked) statusClass = "seat seat-locked";
                  else if (isSelected) statusClass = "seat seat-selected";

                  return (
                    <div
                      key={seatIdx}
                      className={statusClass}
                      onClick={() => handleClick(seat)}
                      title={`Seat ${seat.seatNumber} (${seat.status})`}
                    >
                      <span className="seat-cushion" />
                      <span className="seat-number">{isLocked ? "🔒" : seat.seatNumber}</span>
                      <span className="seat-armrest left" />
                      <span className="seat-armrest right" />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="seat-legend">
        <div className="legend-item">
          <div className="seat seat-available legend-swatch">
            <span className="seat-cushion" />
            <span className="seat-number">A1</span>
            <span className="seat-armrest left" />
            <span className="seat-armrest right" />
          </div>
          <span>Available</span>
        </div>

        <div className="legend-item">
          <div className="seat seat-selected legend-swatch">
            <span className="seat-cushion" />
            <span className="seat-number">A2</span>
            <span className="seat-armrest left" />
            <span className="seat-armrest right" />
          </div>
          <span>Selected</span>
        </div>

        <div className="legend-item">
          <div className="seat seat-booked legend-swatch">
            <span className="seat-cushion" />
            <span className="seat-number">A3</span>
            <span className="seat-armrest left" />
            <span className="seat-armrest right" />
          </div>
          <span>Booked</span>
        </div>

        <div className="legend-item">
          <div className="seat seat-locked legend-swatch">
            <span className="seat-cushion" />
            <span className="seat-number">🔒</span>
            <span className="seat-armrest left" />
            <span className="seat-armrest right" />
          </div>
          <span>Locked</span>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CITIES = ["Mangaluru", "Bengaluru", "Mysuru", "Chennai", "Hyderabad", "Kochi", "Goa", "Mumbai", "Pune", "Coimbatore"];

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

const RouteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);

const SwapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 18h14"/><path d="m7 22-4-4 4-4"/><path d="M21 6H7"/></svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

export default function Home() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("Mangaluru");
  const [to, setTo] = useState("Bengaluru");
  const [date, setDate] = useState(tomorrowISO());
  const [passengers, setPassengers] = useState(1);

  const handleSearch = (e) => {
    e.preventDefault();
    if (from === to) {
      alert("Origin and destination cannot be the same city");
      return;
    }
    navigate(`/search?from=${from}&to=${to}&date=${date}&passengers=${passengers}`);
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const incrementPax = () => {
    if (passengers < 6) setPassengers(prev => prev + 1);
  };

  const decrementPax = () => {
    if (passengers > 1) setPassengers(prev => prev - 1);
  };

  return (
    <div>
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">
            Your Journey Starts Here.
          </h1>
          <p className="hero-sub">
            Travel across India in comfort. SmartBus offers premium seat selection, real-time seat tracking, 
            instant booking confirmations, and safe journeys with verified operators.
          </p>
        </div>

        <div className="container">
          <form className="search-card" onSubmit={handleSearch}>
            <div className="search-inputs-row">
              <div className="field">
                <label htmlFor="from">
                  <RouteIcon /> From
                </label>
                <select id="from" value={from} onChange={(e) => setFrom(e.target.value)}>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <button type="button" className="swap-btn" onClick={handleSwap} aria-label="Swap cities">
                <SwapIcon />
              </button>

              <div className="field">
                <label htmlFor="to">
                  <RouteIcon /> To
                </label>
                <select id="to" value={to} onChange={(e) => setTo(e.target.value)}>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="date">
                  <CalendarIcon /> Journey date
                </label>
                <input id="date" type="date" min={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} />
              </div>

              <div className="field">
                <label>
                  <UsersIcon /> Passengers
                </label>
                <div className="pax-control">
                  <button type="button" className="pax-btn" onClick={decrementPax} disabled={passengers <= 1}>−</button>
                  <span className="pax-display">{passengers} {passengers === 1 ? "Passenger" : "Passengers"}</span>
                  <button type="button" className="pax-btn" onClick={incrementPax} disabled={passengers >= 6}>+</button>
                </div>
              </div>
            </div>

            <button className="btn btn-primary search-submit" type="submit">
              Search Buses
            </button>
          </form>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>50+</h3>
              <p>Active Routes</p>
            </div>
            <div className="stat-card">
              <h3>100+</h3>
              <p>Premium Buses</p>
            </div>
            <div className="stat-card">
              <h3>10,000+</h3>
              <p>Happy Customers</p>
            </div>
            <div className="stat-card">
              <h3>4.8 ★</h3>
              <p>Customer Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="page-section container">
        <h2 className="section-title text-center">Popular Routes</h2>
        <p className="section-subtitle text-center">Quick booking for our most-travelled Indian routes</p>
        <div className="routes-grid">
          {[
            ["Mangaluru", "Bengaluru", "₹499 onwards"],
            ["Bengaluru", "Chennai", "₹599 onwards"],
            ["Bengaluru", "Hyderabad", "₹799 onwards"],
            ["Mangaluru", "Mysuru", "₹399 onwards"],
          ].map(([f, t, price]) => (
            <button
              key={`${f}-${t}`}
              className="route-card-btn"
              onClick={() => navigate(`/search?from=${f}&to=${t}&date=${tomorrowISO()}&passengers=1`)}
            >
              <div className="route-card-banner">POPULAR ROUTE</div>
              <div className="route-card-cities">
                <span>{f}</span>
                <span className="route-arrow">→</span>
                <span>{t}</span>
              </div>
              <div className="route-card-price">{price}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Why SmartBus */}
      <section className="why-choose-section page-section">
        <div className="container">
          <h2 className="section-title text-center">Why Choose SmartBus?</h2>
          <p className="section-subtitle text-center">Redefining bus travel in India with tech-driven comfort</p>
          
          <div className="features-grid">
            {[
              [
                "Real Seat Locking", 
                "Your selected seats are held securely for 5 minutes. No double bookings or mid-checkout loss.",
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              ],
              [
                "Verified Operators & Safety", 
                "We partner only with top-tier operators offering clean buses, certified drivers, and SOS alerts.",
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              ],
              [
                "Instant PNR & QR Ticket", 
                "Get an automated scannable QR ticket instantly generated upon payment. Zero printouts needed.",
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01"/><path d="M7 12h10M12 7v10"/></svg>
              ]
            ].map(([title, body, icon]) => (
              <div className="feature-card" key={title}>
                <div className="feature-icon-wrapper">{icon}</div>
                <h4>{title}</h4>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple 3-step booking process */}
      <section className="page-section container">
        <h2 className="section-title text-center">Book in 3 Simple Steps</h2>
        <p className="section-subtitle text-center">Quickest way to secure your travel seats</p>
        <div className="steps-grid">
          {[
            ["1", "Search Trips", "Enter your origin, destination, and select date & passengers to view available buses."],
            ["2", "Choose Seats", "Interactive real-time seat map lets you pick your exact seating with passenger limits."],
            ["3", "Pay & Travel", "Complete secure mock checkout and get your scannable e-ticket with instant PNR."]
          ].map(([stepNum, stepTitle, stepBody]) => (
            <div className="step-card" key={stepNum}>
              <div className="step-number">{stepNum}</div>
              <h4>{stepTitle}</h4>
              <p>{stepBody}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer">SmartBus — a demo travel-booking platform built for portfolio purposes.</footer>
    </div>
  );
}


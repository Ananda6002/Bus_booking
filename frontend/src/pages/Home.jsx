import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CITIES = ["Mangaluru", "Bengaluru", "Mysuru", "Chennai", "Hyderabad", "Kochi", "Goa", "Mumbai", "Pune", "Coimbatore"];

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export default function Home() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("Mangaluru");
  const [to, setTo] = useState("Bengaluru");
  const [date, setDate] = useState(todayISO());
  const [passengers, setPassengers] = useState(1);

  const handleSearch = (e) => {
    e.preventDefault();
    if (from === to) {
      alert("Origin and destination cannot be the same city");
      return;
    }
    navigate(`/search?from=${from}&to=${to}&date=${date}&passengers=${passengers}`);
  };

  return (
    <div>
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">
            Book bus tickets across India, <span>without the runaround.</span>
          </h1>
          <p className="hero-sub">
            Real-time seats, transparent pricing, and an e-ticket that just works. Search thousands of trips from
            trusted operators.
          </p>
        </div>

        <div className="container">
          <form className="search-card" onSubmit={handleSearch}>
            <div className="field">
              <label htmlFor="from">From</label>
              <select id="from" value={from} onChange={(e) => setFrom(e.target.value)}>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="to">To</label>
              <select id="to" value={to} onChange={(e) => setTo(e.target.value)}>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="date">Journey date</label>
              <input id="date" type="date" min={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="pax">Passengers</label>
              <input
                id="pax"
                type="number"
                min={1}
                max={6}
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
              />
            </div>
            <button className="btn btn-primary" type="submit">
              Search Buses
            </button>
          </form>
        </div>
      </section>

      <section className="page-section container">
        <h2 className="section-title">Popular routes</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {[
            ["Mangaluru", "Bengaluru"],
            ["Bengaluru", "Chennai"],
            ["Bengaluru", "Hyderabad"],
            ["Mangaluru", "Mysuru"],
          ].map(([f, t]) => (
            <button
              key={`${f}-${t}`}
              className="card"
              style={{ textAlign: "left", cursor: "pointer", border: "none" }}
              onClick={() => navigate(`/search?from=${f}&to=${t}&date=${todayISO()}&passengers=1`)}
            >
              <div className="label-sm">Popular route</div>
              <div style={{ fontWeight: 700, fontSize: "1.05rem", marginTop: 4 }}>
                {f} → {t}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="page-section container">
        <h2 className="section-title">Why SmartBus</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {[
            ["Real seat locking", "Your selected seats are held for 5 minutes so nobody else can grab them mid-checkout."],
            ["Backend-verified pricing", "Fares are always recalculated server-side — what you see is what you pay."],
            ["Instant e-ticket", "A scannable QR e-ticket and PNR are generated the moment payment succeeds."],
          ].map(([title, body]) => (
            <div className="card" key={title}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
              <div style={{ color: "var(--ink-soft)", fontSize: "0.92rem" }}>{body}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer">SmartBus — a demo travel-booking platform built for portfolio purposes.</footer>
    </div>
  );
}

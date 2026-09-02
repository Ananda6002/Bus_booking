import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import BusCard from "../components/BusCard";

const BUS_TYPES = ["AC Seater", "AC Sleeper", "Non-AC Seater", "AC Semi-Sleeper"];

export default function SearchResults() {
  const [params] = useSearchParams();
  const from = params.get("from");
  const to = params.get("to");
  const date = params.get("date");
  const passengers = params.get("passengers") || "1";

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [maxPrice, setMaxPrice] = useState(3000);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get("/trips/search", { params: { from, to, date, sortBy } })
      .then((res) => setTrips(res.data.trips))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [from, to, date, sortBy]);

  const toggleType = (type) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  const filteredTrips = useMemo(() => {
    let res = trips;
    if (selectedTypes.length > 0) {
      res = res.filter((t) => selectedTypes.includes(t.busType));
    }
    res = res.filter((t) => t.price <= maxPrice);
    return res;
  }, [trips, selectedTypes, maxPrice]);

  return (
    <div className="container page-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <h2 className="section-title" style={{ margin: 0 }}>
          {from} → {to} <span style={{ color: "var(--ink-soft)", fontWeight: 400, fontSize: "1.1rem" }}>· {date}</span>
        </h2>
        <button 
          className="btn btn-outline mobile-filter-toggle" 
          onClick={() => setShowFiltersMobile(!showFiltersMobile)}
          style={{ display: "none" }}
        >
          {showFiltersMobile ? "Hide Filters" : "Filter & Sort"}
        </button>
      </div>

      <div className="search-results-layout">
        <aside className={`filters card ${showFiltersMobile ? "mobile-show" : ""}`}>
          <h3 style={{ fontSize: "1.2rem", marginBottom: 18, borderBottom: "1.5px solid var(--border)", paddingBottom: 10 }}>Filters</h3>
          
          <div className="filter-group">
            <h4>Bus type</h4>
            {BUS_TYPES.map((type) => (
              <label className="checkbox-row" key={type}>
                <input type="checkbox" checked={selectedTypes.includes(type)} onChange={() => toggleType(type)} />
                {type}
              </label>
            ))}
          </div>

          <div className="filter-group" style={{ marginTop: 20 }}>
            <h4>Max Price: ₹{maxPrice}</h4>
            <input 
              type="range" 
              min="200" 
              max="3000" 
              step="50" 
              value={maxPrice} 
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--amber-deep)", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--ink-soft)", marginTop: 4 }}>
              <span>₹200</span>
              <span>₹3000</span>
            </div>
          </div>

          <div className="filter-group" style={{ marginTop: 24 }}>
            <h4>Sort by</h4>
            {[
              ["", "Recommended"],
              ["price_low", "Cheapest first"],
              ["earliest", "Earliest departure"],
              ["duration", "Shortest duration"],
              ["rating", "Highest rated"],
            ].map(([value, label]) => (
              <label className="checkbox-row" key={value}>
                <input type="radio" name="sortBy" checked={sortBy === value} onChange={() => setSortBy(value)} />
                {label}
              </label>
            ))}
          </div>
        </aside>

        <main>
          {loading && <div className="empty-state">Searching buses...</div>}
          {error && <div className="error-banner">{error}</div>}
          {!loading && !error && filteredTrips.length === 0 && (
            <div className="empty-state card">
              <h3>No buses found</h3>
              <p>Try a different filter or search criteria.</p>
            </div>
          )}
          {!loading && filteredTrips.map((trip) => (
            <BusCard trip={trip} key={trip.tripId} passengers={passengers} />
          ))}
        </main>
      </div>
    </div>
  );
}

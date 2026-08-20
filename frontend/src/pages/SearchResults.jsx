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

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);

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
    if (selectedTypes.length === 0) return trips;
    return trips.filter((t) => selectedTypes.includes(t.busType));
  }, [trips, selectedTypes]);

  return (
    <div className="container page-section">
      <h2 className="section-title">
        {from} → {to} <span style={{ color: "var(--ink-soft)", fontWeight: 400, fontSize: "1.1rem" }}>· {date}</span>
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 24, alignItems: "start" }}>
        <aside className="filters">
          <div className="filter-group">
            <h4>Bus type</h4>
            {BUS_TYPES.map((type) => (
              <label className="checkbox-row" key={type}>
                <input type="checkbox" checked={selectedTypes.includes(type)} onChange={() => toggleType(type)} />
                {type}
              </label>
            ))}
          </div>
          <div className="filter-group">
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
            <div className="empty-state">
              <h3>No buses found</h3>
              <p>Try a different date or route.</p>
            </div>
          )}
          {!loading && filteredTrips.map((trip) => <BusCard trip={trip} key={trip.tripId} />)}
        </main>
      </div>
    </div>
  );
}

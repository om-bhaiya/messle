import { useState } from "react";
import MessCard from "../components/MessCard";
import { mockMesses } from "../data/mockData";

const HomePage = () => {
  const [messes, setMesses] = useState(mockMesses);
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");

  const areas = ["all", ...new Set(messes.map((m) => m.area))];

  const filteredMesses = messes.filter((mess) => {
    const areaMatch = selectedArea === "all" || mess.area === selectedArea;

    const priceMatch =
      selectedPrice === "all" ||
      (selectedPrice === "0-2000" && mess.monthlyPrice <= 2000) ||
      (selectedPrice === "2000-2500" &&
        mess.monthlyPrice > 2000 &&
        mess.monthlyPrice <= 2500) ||
      (selectedPrice === "2500-3000" &&
        mess.monthlyPrice > 2500 &&
        mess.monthlyPrice <= 3000) ||
      (selectedPrice === "3000+" && mess.monthlyPrice > 3000);

    const ratingMatch =
      selectedRating === "all" ||
      (selectedRating === "4+" && mess.rating >= 4) ||
      (selectedRating === "3-4" && mess.rating >= 3 && mess.rating < 4) ||
      (selectedRating === "3-" && mess.rating < 3);

    return areaMatch && priceMatch && ratingMatch;
  });

  return (
    <div
      style={{ background: "#f7f5f2", minHeight: "100vh", color: "#3b2f2f" }}
    >
      {/* Top Bar */}
      <div
        style={{
          background: "#3b2f2f",
          color: "white",
          padding: "14px 16px",
        }}
      >
        <h1
          style={{ fontSize: "18px", fontWeight: "600", marginBottom: "2px" }}
        >
          Messes in Kota
        </h1>
        <span style={{ fontSize: "12px", opacity: "0.8" }}>
          Prices, ratings, today's food
        </span>
      </div>

      {/* Filters */}
      <div
        style={{
          background: "white",
          padding: "12px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "8px",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          style={{
            padding: "8px",
            fontSize: "13px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            background: "#fff",
          }}
        >
          <option value="all">All Areas</option>
          {areas
            .filter((a) => a !== "all")
            .map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
        </select>

        <select
          value={selectedPrice}
          onChange={(e) => setSelectedPrice(e.target.value)}
          style={{
            padding: "8px",
            fontSize: "13px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            background: "#fff",
          }}
        >
          <option value="all">Any Price</option>
          <option value="0-2000">Under ₹2000</option>
          <option value="2000-2500">₹2000 - ₹2500</option>
          <option value="2500-3000">₹2500 - ₹3000</option>
          <option value="3000+">Above ₹3000</option>
        </select>

        <select
          value={selectedRating}
          onChange={(e) => setSelectedRating(e.target.value)}
          style={{
            padding: "8px",
            fontSize: "13px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            background: "#fff",
          }}
        >
          <option value="all">Any Rating</option>
          <option value="4+">4★ & above</option>
          <option value="3-4">3★ & above</option>
          <option value="3-">Below 3★</option>
        </select>
      </div>

      {/* Mess List */}
      <div style={{ padding: "14px" }}>
        {filteredMesses.length > 0 ? (
          filteredMesses.map((mess) => <MessCard key={mess.id} mess={mess} />)
        ) : (
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "40px 14px",
              textAlign: "center",
            }}
          >
            <p style={{ color: "#777", marginBottom: "12px" }}>
              No messes found
            </p>
            <button
              onClick={() => {
                setSelectedArea("all");
                setSelectedPrice("all");
                setSelectedRating("all");
              }}
              style={{
                background: "#f4c430",
                border: "none",
                padding: "9px 20px",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          padding: "16px",
          fontSize: "12px",
          color: "#777",
        }}
      >
        Simple by design. Built for daily use.
      </div>
    </div>
  );
};

export default HomePage;

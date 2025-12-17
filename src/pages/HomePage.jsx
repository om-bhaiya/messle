import { useState, useEffect } from "react";
import { Filter } from "lucide-react";
import MessCard from "../components/MessCard";
import { getMessesByCity } from "../services/database";
import { getUserLocation, calculateDistance } from "../utils/distance";

const HomePage = () => {
  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(false);
  const [selectedDistance, setSelectedDistance] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");

  // Fetch messes
  useEffect(() => {
    const fetchMesses = async () => {
      setLoading(true);
      const data = await getMessesByCity("Kota");
      setMesses(data);
      setLoading(false);
    };

    fetchMesses();
  }, []);

  // Request location when distance filter is used
  const handleDistanceFilterChange = async (value) => {
    setSelectedDistance(value);

    if (value !== "all" && !userLocation && !locationError) {
      try {
        const location = await getUserLocation();
        setUserLocation(location);
      } catch (error) {
        console.error("Location error:", error);
        setLocationError(true);
        alert("Could not get your location. Showing all messes.");
        setSelectedDistance("all");
      }
    }
  };

  // Calculate distances and filter
  const filteredMesses = messes
    .map((mess) => {
      if (userLocation) {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          mess.location.lat,
          mess.location.lng
        );
        return { ...mess, distance };
      }
      return mess;
    })
    .filter((mess) => {
      // Distance filter
      const distanceMatch =
        selectedDistance === "all" ||
        !userLocation ||
        (selectedDistance === "1" && mess.distance <= 1) ||
        (selectedDistance === "2" && mess.distance <= 2) ||
        (selectedDistance === "5" && mess.distance <= 5) ||
        (selectedDistance === "10" && mess.distance <= 10);

      // Price filter
      const priceMatch =
        selectedPrice === "all" ||
        (selectedPrice === "0-3000" && mess.monthlyPrice <= 3000) ||
        (selectedPrice === "3000-4000" &&
          mess.monthlyPrice > 3000 &&
          mess.monthlyPrice <= 4000) ||
        (selectedPrice === "4000-5000" &&
          mess.monthlyPrice > 4000 &&
          mess.monthlyPrice <= 5000) ||
        (selectedPrice === "5000+" && mess.monthlyPrice > 5000);

      // Rating filter
      const ratingMatch =
        selectedRating === "all" ||
        (selectedRating === "4+" && mess.rating >= 4) ||
        (selectedRating === "3-4" && mess.rating >= 3 && mess.rating < 4) ||
        (selectedRating === "3-" && mess.rating < 3 && mess.rating > 0) ||
        (selectedRating === "new" && mess.rating === 0);

      return distanceMatch && priceMatch && ratingMatch;
    })
    .sort((a, b) => {
      // Sort by distance if available
      if (
        userLocation &&
        a.distance !== undefined &&
        b.distance !== undefined
      ) {
        return a.distance - b.distance;
      }
      return 0;
    });

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#f7f5f2",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #f4c430",
              borderTop: "4px solid transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <p style={{ color: "#3b2f2f", fontSize: "14px" }}>
            Loading messes...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{ background: "#f7f5f2", minHeight: "100vh", color: "#3b2f2f" }}
    >
      {/* Header */}
      <div
        style={{ background: "#3b2f2f", color: "white", padding: "14px 16px" }}
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
        {/* Distance Filter */}
        <select
          value={selectedDistance}
          onChange={(e) => handleDistanceFilterChange(e.target.value)}
          style={{
            padding: "8px",
            fontSize: "13px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            background: "#fff",
          }}
        >
          <option value="all">Distance</option>
          <option value="1">Within 1 km</option>
          <option value="2">Within 2 km</option>
          <option value="5">Within 5 km</option>
          <option value="10">Within 10 km</option>
        </select>

        {/* Price Filter */}
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
          <option value="0-3000">Under ₹3000</option>
          <option value="3000-4000">₹3000 - ₹4000</option>
          <option value="4000-5000">₹4000 - ₹5000</option>
          <option value="5000+">Above ₹5000</option>
        </select>

        {/* Rating Filter */}
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
          <option value="new">New (No ratings)</option>
        </select>
      </div>

      {/* Mess List */}
      <div style={{ padding: "14px" }}>
        {filteredMesses.length > 0 ? (
          <>
            <p
              style={{ fontSize: "12px", color: "#777", marginBottom: "12px" }}
            >
              {filteredMesses.length} mess
              {filteredMesses.length !== 1 ? "es" : ""} found
              {userLocation &&
                selectedDistance !== "all" &&
                ` within ${selectedDistance} km`}
            </p>
            {filteredMesses.map((mess) => (
              <MessCard key={mess.id} mess={mess} userLocation={userLocation} />
            ))}
          </>
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
              {messes.length === 0
                ? "No messes available in Kota"
                : "No messes found with selected filters"}
            </p>
            {messes.length > 0 && (
              <button
                onClick={() => {
                  setSelectedDistance("all");
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
            )}
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

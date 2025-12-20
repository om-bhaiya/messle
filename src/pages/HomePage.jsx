import { useState, useEffect } from "react";
import { Filter } from "lucide-react";
import MessCard from "../components/MessCard";

import { getMessesByCity, getTodayMenu } from "../services/database";
import {
  trackVisitor,
  updatePresence,
  getTodayVisitorCount,
  getActiveUsersCount,
  fetchAndCacheCounts,
} from "../services/analytics";

import { getUserLocation, calculateDistance } from "../utils/distance";
import { sortMessesByScore } from "../utils/ranking";
import { isToday } from "../utils/dateHelpers";

const HomePage = () => {
  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(false);
  const [selectedDistance, setSelectedDistance] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");

  const [todayVisitors, setTodayVisitors] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);

  // Fetch messes
  useEffect(() => {
    const fetchMesses = async () => {
      setLoading(true);
      const data = await getMessesByCity("Kota");

      // Check if each mess has today's menu
      const today = new Date().toISOString().split("T")[0];
      const messesWithMenuStatus = await Promise.all(
        data.map(async (mess) => {
          const menu = await getTodayMenu(mess.id);
          // Check both date AND if updatedAt is today
          const isMenuToday =
            menu &&
            menu.date === today &&
            menu.updatedAt &&
            isToday(menu.updatedAt);
          return {
            ...mess,
            menuUpdatedToday: isMenuToday,
          };
        })
      );

      setMesses(messesWithMenuStatus);
      setLoading(false);
    };

    fetchMesses();
  }, []);

  // Track visitor and update presence (OPTIMIZED)
  useEffect(() => {
    // Track this visit (non-blocking, runs in background)
    trackVisitor();

    // Update presence every 3 minutes (reduced from 2)
    const presenceInterval = setInterval(() => {
      updatePresence();
    }, 3 * 60 * 1000); // 3 minutes

    // Cleanup on unmount
    return () => clearInterval(presenceInterval);
  }, []);

  // Fetch analytics data (OPTIMIZED WITH CACHING)
  useEffect(() => {
    const fetchAnalytics = async () => {
      // Try to get from cache first
      const visitors = await getTodayVisitorCount();
      const active = await getActiveUsersCount();

      setTodayVisitors(visitors);
      setActiveUsers(active);

      // Fetch fresh data and update cache in background
      fetchAndCacheCounts();
    };

    // Fetch immediately
    fetchAnalytics();

    // Refresh every 5 minutes (reduced from 30 seconds)
    const analyticsInterval = setInterval(() => {
      fetchAndCacheCounts().then((counts) => {
        if (counts) {
          setTodayVisitors(counts.visitors);
          setActiveUsers(counts.active);
        }
      });
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(analyticsInterval);
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
      // If distance filter is active, sort by distance
      if (
        selectedDistance !== "all" &&
        userLocation &&
        a.distance !== undefined &&
        b.distance !== undefined
      ) {
        return a.distance - b.distance;
      }

      // Otherwise, use ranking algorithm
      const sortedByScore = sortMessesByScore([a, b]);
      return sortedByScore[0].id === a.id ? -1 : 1;
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

        {/* Analytics Display */}
        <div
          style={{
            marginTop: "12px",
            display: "flex",
            gap: "16px",
            fontSize: "11px",
            opacity: "0.9",
          }}
        >
          <div>
            <span style={{ opacity: "0.7" }}>Today's visitors: </span>
            <span style={{ fontWeight: "600" }}>{todayVisitors}</span>
          </div>
          <div>
            <span style={{ opacity: "0.7" }}>Online now: </span>
            <span style={{ fontWeight: "600", color: "#4ade80" }}>
              {activeUsers}
            </span>
          </div>
        </div>
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

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

  const [locationPermissionAsked, setLocationPermissionAsked] = useState(false);

  // Fetch messes (OPTIMIZED - NO MENU CHECKS)
  useEffect(() => {
    const fetchMesses = async () => {
      setLoading(true);
      const data = await getMessesByCity("Kota");

      // No need to check menus individually anymore!
      // The menuUpdatedToday field is already in mess documents
      setMesses(data);
      setLoading(false);
    };

    fetchMesses();
  }, []);

  // Request location on page load
  useEffect(() => {
    const requestLocation = async () => {
      try {
        // Always try to get location (browser will handle permission)
        const location = await getUserLocation();

        // Success - got location
        setUserLocation(location);
        setLocationError(false);

        // Cache location for this session
        sessionStorage.setItem("userLat", location.lat.toString());
        sessionStorage.setItem("userLng", location.lng.toString());
      } catch (error) {
        // Failed to get location
        console.error("Location error:", error);

        // Check if we have cached location
        const cachedLat = sessionStorage.getItem("userLat");
        const cachedLng = sessionStorage.getItem("userLng");

        if (cachedLat && cachedLng) {
          // Use cached location
          setUserLocation({
            lat: parseFloat(cachedLat),
            lng: parseFloat(cachedLng),
          });
          setLocationError(false);
        } else {
          // No cached location, show error
          setLocationError(true);
        }
      }
    };

    requestLocation();
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

  const handleDistanceFilterChange = (value) => {
    setSelectedDistance(value);
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
      // Always sort by distance if location is available
      if (
        userLocation &&
        a.distance !== undefined &&
        b.distance !== undefined
      ) {
        // If distance filter is active, respect it
        if (selectedDistance !== "all") {
          return a.distance - b.distance;
        }

        // Otherwise, use ranking algorithm but boost nearby messes
        const sortedByScore = sortMessesByScore([a, b]);

        // If distances are very different (>2km), prioritize closer mess
        const distanceDiff = Math.abs(a.distance - b.distance);
        if (distanceDiff > 2) {
          return a.distance - b.distance;
        }

        // Otherwise use score
        return sortedByScore[0].id === a.id ? -1 : 1;
      }

      // No location available, use ranking algorithm only
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "2px",
              }}
            >
              Messes in Kota
            </h1>
            <span style={{ fontSize: "12px", opacity: "0.8" }}>
              Prices, ratings, today's food
            </span>
          </div>

          {/* Location Status */}
          {userLocation && (
            <div
              style={{
                background: "rgba(74, 222, 128, 0.2)",
                padding: "4px 10px",
                borderRadius: "12px",
                fontSize: "11px",
                color: "#4ade80",
                fontWeight: "600",
              }}
            >
              📍 Showing Near You
            </div>
          )}
          {locationError && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.2)",
                padding: "4px 10px",
                borderRadius: "12px",
                fontSize: "11px",
                color: "#ef4444",
                fontWeight: "600",
              }}
            >
              📍 Location Off
            </div>
          )}
        </div>

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

      {/* Location Error Message - Enhanced */}
      {locationError && (
        <div
          style={{
            background: "linear-gradient(135deg, #fff9e6 0%, #fef3c7 100%)",
            padding: "16px",
            borderBottom: "2px solid #f4c430",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                animation: "pulse 2s infinite",
              }}
            >
              📍
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#3b2f2f",
                  marginBottom: "6px",
                }}
              >
                Enable Location for Better Results
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  lineHeight: "1.6",
                }}
              >
                See distances to messes near you!
              </div>
            </div>
          </div>

          {/* Visual Guide */}
          <div
            style={{
              background: "white",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "12px",
              color: "#3b2f2f",
              lineHeight: "1.6",
              marginBottom: "10px",
              border: "1px solid #f4c430",
            }}
          >
            <div style={{ fontWeight: "600", marginBottom: "8px" }}>
              How to enable:
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "4px",
              }}
            >
              <span style={{ fontSize: "16px" }}>1️⃣</span>
              <span>
                Click the <strong style={{ color: "#f59e0b" }}>🛈</strong> or{" "}
                <strong style={{ color: "#f59e0b" }}>🔒</strong> icon next to
                the URL
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "4px",
              }}
            >
              <span style={{ fontSize: "16px" }}>2️⃣</span>
              <span>Find "Location" permissions</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "4px",
              }}
            >
              <span style={{ fontSize: "16px" }}>3️⃣</span>
              <span>
                Select <strong style={{ color: "#059669" }}>"Allow"</strong>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "16px" }}>4️⃣</span>
              <span>Click "Retry" below</span>
            </div>
          </div>

          <button
            onClick={() => {
              // Clear everything and force reload
              sessionStorage.clear();
              window.location.reload();
            }}
            style={{
              background: "#f4c430",
              border: "none",
              padding: "10px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <span>🔄</span>
            <span>Reload Page</span>
          </button>

          <div
            style={{
              fontSize: "11px",
              color: "#999",
              textAlign: "center",
              marginTop: "8px",
            }}
          >
            You can still browse without location
          </div>

          <style>{`
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
      }
    `}</style>
        </div>
      )}

      {/* Mess List */}
      <div style={{ padding: "14px" }}>
        {filteredMesses.length > 0 ? (
          <>
            <p
              style={{ fontSize: "12px", color: "#777", marginBottom: "12px" }}
            >
              {filteredMesses.length} mess
              {filteredMesses.length !== 1 ? "es" : ""} found
              {userLocation && " • Sorted by distance"}
              {selectedDistance !== "all" && ` within ${selectedDistance} km`}
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

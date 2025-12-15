import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Phone, MapPin, Edit } from "lucide-react";
import { getMessById, getTodayMenu } from "../services/database";
import { saveRating, hasUserRated, getUserRating } from "../services/ratings";

const MessDetailPage = () => {
  const { messId } = useParams();
  const navigate = useNavigate();

  const [mess, setMess] = useState(null);
  const [todayMenu, setTodayMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const messData = await getMessById(messId);
      const menuData = await getTodayMenu(messId);

      setMess(messData);
      setTodayMenu(menuData);

      // Check if user already rated
      const rated = hasUserRated(messId);
      setHasRated(rated);

      if (rated) {
        const rating = getUserRating(messId);
        setUserRating(rating);
      }

      setLoading(false);
    };

    fetchData();
  }, [messId]);

  const handleRating = async (rating) => {
    if (hasRated) {
      alert("You have already rated this mess!");
      return;
    }

    setRatingLoading(true);
    const result = await saveRating(messId, rating);

    if (result.success) {
      setUserRating(rating);
      setHasRated(true);

      // Update local mess data
      const updatedMess = await getMessById(messId);
      setMess(updatedMess);

      alert("Thanks for rating! ⭐");
    } else {
      alert("Failed to save rating. Please try again.");
    }

    setRatingLoading(false);
  };

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
          <p style={{ color: "#3b2f2f", fontSize: "14px" }}>Loading...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!mess) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          background: "#f7f5f2",
          minHeight: "100vh",
        }}
      >
        <p style={{ marginTop: "40px", color: "#777" }}>Mess not found</p>
        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: "20px",
            background: "#f4c430",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Go Back Home
        </button>
      </div>
    );
  }

  const getTypeBadge = () => {
    const baseStyle = {
      fontSize: "12px",
      padding: "5px 12px",
      borderRadius: "20px",
      color: "white",
      display: "inline-block",
      marginTop: "8px",
    };

    if (mess.type === "veg") {
      return <span style={{ ...baseStyle, background: "#2e7d32" }}>Veg</span>;
    } else if (mess.type === "non-veg") {
      return (
        <span style={{ ...baseStyle, background: "#8b1e1e" }}>Non-Veg</span>
      );
    } else {
      return (
        <span style={{ ...baseStyle, background: "#8b1e1e" }}>
          Veg + Non-Veg
        </span>
      );
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const isMenuUpdated = todayMenu && todayMenu.date === today;

  return (
    <div
      style={{
        background: "#f7f5f2",
        minHeight: "100vh",
        paddingBottom: "60px",
      }}
    >
      {/* Header */}
      <div
        style={{ background: "#3b2f2f", color: "white", padding: "14px 16px" }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
            padding: "0",
            marginBottom: "8px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <ArrowLeft size={20} />
          <span style={{ fontSize: "14px" }}>Back</span>
        </button>
        <h1 style={{ fontSize: "20px", fontWeight: "600" }}>{mess.name}</h1>
        <p style={{ fontSize: "13px", opacity: "0.8", marginTop: "2px" }}>
          {mess.area}, Kota
        </p>
        {getTypeBadge()}
      </div>

      {/* Photos Section */}
      {mess.photos && mess.photos.length > 0 && (
        <div
          style={{
            background: "white",
            padding: "14px",
            marginBottom: "8px",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "10px",
            }}
          >
            Photos
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
            }}
          >
            {mess.photos.slice(0, 3).map((photo, idx) => (
              <div
                key={idx}
                style={{
                  background: "#e0e0e0",
                  borderRadius: "8px",
                  height: "100px",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pricing */}
      <div
        style={{
          background: "white",
          padding: "14px",
          marginBottom: "8px",
        }}
      >
        <h3
          style={{ fontSize: "16px", fontWeight: "600", marginBottom: "10px" }}
        >
          Pricing
        </h3>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <span style={{ fontSize: "14px", color: "#555" }}>Monthly (Veg)</span>
          <span style={{ fontSize: "14px", fontWeight: "600" }}>
            ₹{mess.monthlyPrice}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "14px", color: "#555" }}>Per Meal</span>
          <span style={{ fontSize: "14px", fontWeight: "600" }}>
            ₹{mess.perMealPrice}
          </span>
        </div>
      </div>

      {/* Today's Menu */}
      <div
        style={{
          background: "white",
          padding: "14px",
          marginBottom: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <h3 style={{ fontSize: "16px", fontWeight: "600" }}>Today's Menu</h3>
          <Edit size={18} style={{ color: "#f4c430", cursor: "pointer" }} />
        </div>

        {isMenuUpdated ? (
          <div>
            {mess.services.includes("breakfast") && todayMenu.breakfast && (
              <div style={{ marginBottom: "10px" }}>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#8b1e1e",
                  }}
                >
                  Breakfast:
                </p>
                <p style={{ fontSize: "14px", color: "#555" }}>
                  {todayMenu.breakfast}
                </p>
              </div>
            )}
            {mess.services.includes("lunch") && todayMenu.lunch && (
              <div style={{ marginBottom: "10px" }}>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#8b1e1e",
                  }}
                >
                  Lunch:
                </p>
                <p style={{ fontSize: "14px", color: "#555" }}>
                  {todayMenu.lunch}
                </p>
              </div>
            )}
            {mess.services.includes("dinner") && todayMenu.dinner && (
              <div style={{ marginBottom: "10px" }}>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#8b1e1e",
                  }}
                >
                  Dinner:
                </p>
                <p style={{ fontSize: "14px", color: "#555" }}>
                  {todayMenu.dinner}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p style={{ fontSize: "14px", color: "#999", fontStyle: "italic" }}>
            Menu not updated today
          </p>
        )}
      </div>

      {/* Timings */}
      <div
        style={{
          background: "white",
          padding: "14px",
          marginBottom: "8px",
        }}
      >
        <h3
          style={{ fontSize: "16px", fontWeight: "600", marginBottom: "10px" }}
        >
          Timings
        </h3>
        {mess.services.includes("breakfast") && mess.timings.breakfast && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontSize: "14px", color: "#555" }}>Breakfast</span>
            <span style={{ fontSize: "14px" }}>
              {mess.timings.breakfast.start} – {mess.timings.breakfast.end}
            </span>
          </div>
        )}
        {mess.services.includes("lunch") && mess.timings.lunch && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontSize: "14px", color: "#555" }}>Lunch</span>
            <span style={{ fontSize: "14px" }}>
              {mess.timings.lunch.start} – {mess.timings.lunch.end}
            </span>
          </div>
        )}
        {mess.services.includes("dinner") && mess.timings.dinner && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontSize: "14px", color: "#555" }}>Dinner</span>
            <span style={{ fontSize: "14px" }}>
              {mess.timings.dinner.start} – {mess.timings.dinner.end}
            </span>
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "12px",
            paddingTop: "12px",
            borderTop: "1px solid #eee",
          }}
        >
          <span style={{ fontSize: "14px", color: "#555" }}>Weekly Off</span>
          <span style={{ fontSize: "14px" }}>{mess.closedDays}</span>
        </div>
      </div>

      {/* Ratings */}
      <div
        style={{
          background: "white",
          padding: "14px",
          marginBottom: "8px",
        }}
      >
        <h3
          style={{ fontSize: "16px", fontWeight: "600", marginBottom: "10px" }}
        >
          Ratings
        </h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "10px",
          }}
        >
          <Star size={20} style={{ fill: "#f4c430", color: "#f4c430" }} />
          <span
            style={{ fontSize: "18px", fontWeight: "600", color: "#8b1e1e" }}
          >
            {mess.rating}
          </span>
          <span style={{ fontSize: "14px", color: "#777" }}>
            ({mess.totalRatings} ratings)
          </span>
        </div>

        {hasRated ? (
          <>
            <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={32}
                  style={{
                    fill: star <= userRating ? "#f4c430" : "none",
                    color: star <= userRating ? "#f4c430" : "#ddd",
                  }}
                />
              ))}
            </div>
            <p
              style={{ fontSize: "13px", color: "#059669", fontWeight: "600" }}
            >
              You rated this mess {userRating} star{userRating !== 1 ? "s" : ""}
            </p>
          </>
        ) : (
          <>
            <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={32}
                  style={{
                    color: "#f4c430",
                    cursor: ratingLoading ? "not-allowed" : "pointer",
                    opacity: ratingLoading ? 0.5 : 1,
                  }}
                  onClick={() => !ratingLoading && handleRating(star)}
                />
              ))}
            </div>
            <p style={{ fontSize: "12px", color: "#999" }}>
              Tap a star to rate
            </p>
          </>
        )}
      </div>

      {/* Contact & Location */}
      <div
        style={{
          background: "white",
          padding: "14px",
          marginBottom: "8px",
        }}
      >
        <h3
          style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px" }}
        >
          Contact & Location
        </h3>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => (window.location.href = `tel:${mess.phone}`)}
            style={{
              flex: 1,
              background: "#f4c430",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <Phone size={16} />
            Call Mess
          </button>
          <button
            onClick={() => window.open(mess.location.mapLink, "_blank")}
            style={{
              flex: 1,
              background: "#eee",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <MapPin size={16} />
            Open Map
          </button>
        </div>
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
        Direct info. No middlemen. No nonsense.
      </div>
    </div>
  );
};

export default MessDetailPage;

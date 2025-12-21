import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Phone, MapPin, Edit, Heart } from "lucide-react";
import ImageLightbox from "../components/ImageLightbox";
import { getRelativeTime, isToday } from "../utils/dateHelpers";
import { isFavorite, toggleFavorite } from "../services/favorites";

import {
  getMessById,
  getTodayMenu,
  updateTodayMenu,
} from "../services/database";

import { saveRating, hasUserRated, getUserRating } from "../services/ratings";
import MenuUpdateModal from "../components/MenuUpdateModal";

import PhotoManagementModal from "../components/PhotoManagementModal";
import { updateMessPhotos } from "../services/photos";

const MessDetailPage = () => {
  const { messId } = useParams();
  const navigate = useNavigate();

  const [mess, setMess] = useState(null);
  const [todayMenu, setTodayMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);

  const [showMenuModal, setShowMenuModal] = useState(false);
  const [menuModalKey, setMenuModalKey] = useState(0);

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoModalKey, setPhotoModalKey] = useState(0);

  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const [favorite, setFavorite] = useState(false);

  // Optimize Cloudinary image URLs
  const optimizeImageUrl = (url, width = 800) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    return url.replace(
      "/upload/",
      `/upload/w_${width},h_${width},c_fill,q_auto,f_auto/`
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const messData = await getMessById(messId);
      const menuData = await getTodayMenu(messId);

      setMess(messData);
      setTodayMenu(menuData);

      // Set favorite status
      if (messData) {
        setFavorite(isFavorite(messId));
      }

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

  const handleMenuUpdate = async (menuData, services) => {
    const result = await updateTodayMenu(messId, menuData, services);

    if (result.success) {
      // Immediately refresh both menu and mess data
      const [updatedMenu, updatedMess] = await Promise.all([
        getTodayMenu(messId),
        getMessById(messId),
      ]);

      setTodayMenu(updatedMenu);
      setMess(updatedMess);

      // Force modal to remount with fresh data
      setMenuModalKey((prev) => prev + 1);

      return true;
    }

    return false;
  };

  const handlePhotosUpdate = async (photoUrls) => {
    const result = await updateMessPhotos(messId, photoUrls);

    if (result.success) {
      const updatedMess = await getMessById(messId);
      setMess(updatedMess);
      setPhotoModalKey((prev) => prev + 1);
      return true;
    }

    return false;
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

        {/* Title with Heart */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "4px",
          }}
        >
          <h1 style={{ fontSize: "20px", fontWeight: "600", flex: 1 }}>
            {mess.name}
          </h1>
          {/* Heart Button */}
          <button
            onClick={() => {
              const newStatus = toggleFavorite(messId);
              setFavorite(newStatus);
            }}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <Heart
              size={22}
              style={{
                fill: favorite ? "#ef4444" : "none",
                color: favorite ? "#ef4444" : "white",
                transition: "all 0.2s",
              }}
            />
          </button>
        </div>

        <p style={{ fontSize: "13px", opacity: "0.8", marginTop: "2px" }}>
          {mess.area}, Kota
        </p>
        {getTypeBadge()}
      </div>

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

      {/* Photos Section */}
      {mess.photos && mess.photos.length > 0 ? (
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
            <h3 style={{ fontSize: "16px", fontWeight: "600" }}>Photos</h3>
            <Edit
              size={18}
              style={{ color: "#f4c430", cursor: "pointer" }}
              onClick={() => setShowPhotoModal(true)}
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
            }}
          >
            {mess.photos.slice(0, 6).map((photo, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setLightboxIndex(idx);
                  setShowLightbox(true);
                }}
                style={{
                  paddingBottom: "100%",
                  position: "relative",
                  background: "#f0f0f0",
                  borderRadius: "8px",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
              >
                <img
                  src={optimizeImageUrl(
                    typeof photo === "string" ? photo : photo.url,
                    400
                  )}
                  alt={`${mess.name} photo ${idx + 1}`}
                  loading="lazy"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.transform = "scale(1.05)")
                  }
                  onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
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
            <h3 style={{ fontSize: "16px", fontWeight: "600" }}>Photos</h3>
            <Edit
              size={18}
              style={{ color: "#f4c430", cursor: "pointer" }}
              onClick={() => setShowPhotoModal(true)}
            />
          </div>
          <p style={{ fontSize: "14px", color: "#999" }}>
            No photos yet. Click edit to add photos.
          </p>
        </div>
      )}
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
          <Edit
            size={18}
            style={{ color: "#f4c430", cursor: "pointer" }}
            onClick={() => setShowMenuModal(true)}
          />
        </div>

        {isMenuUpdated ? (
          <div>
            {/* Last Updated Tag */}
            {todayMenu.updatedAt && isToday(todayMenu.updatedAt) && (
              <div
                style={{
                  display: "inline-block",
                  background: "#d4edda",
                  color: "#155724",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: "600",
                  marginBottom: "12px",
                }}
              >
                ✓ {getRelativeTime(todayMenu.updatedAt)}
              </div>
            )}

            {/* Menu Items */}
            {mess.services.map((service) => {
              const menuItem = todayMenu[service];
              if (menuItem) {
                return (
                  <div key={service} style={{ marginBottom: "10px" }}>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#8b1e1e",
                        textTransform: "capitalize",
                      }}
                    >
                      {service.replace("-", " ")}:
                    </p>
                    <p style={{ fontSize: "14px", color: "#555" }}>
                      {menuItem}
                    </p>
                  </div>
                );
              }
              return null;
            })}
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
      {/* Menu Update Modal */}
      <MenuUpdateModal
        key={menuModalKey}
        isOpen={showMenuModal}
        onClose={() => {
          setShowMenuModal(false);
          setMenuModalKey((prev) => prev + 1);
        }}
        mess={mess}
        currentMenu={todayMenu}
        onUpdateSuccess={handleMenuUpdate}
      />
      {/* Photo Management Modal */}
      <PhotoManagementModal
        key={photoModalKey}
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        mess={mess}
        onUpdateSuccess={handlePhotosUpdate}
      />
      {/* Image Lightbox */}
      <ImageLightbox
        images={mess.photos || []}
        initialIndex={lightboxIndex}
        isOpen={showLightbox}
        onClose={() => setShowLightbox(false)}
      />
    </div>
  );
};

export default MessDetailPage;

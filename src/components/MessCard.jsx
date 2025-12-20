import { Star, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistance } from "../utils/distance";
import { calculateMessScore } from "../utils/ranking";
import { isToday } from "../utils/dateHelpers";

const MessCard = ({ mess, userLocation }) => {
  const navigate = useNavigate();

  // Optimize Cloudinary image URLs
  const optimizeImageUrl = (url, width = 400) => {
    if (!url || !url.includes("cloudinary.com")) return url;

    // Insert transformation parameters
    return url.replace(
      "/upload/",
      `/upload/w_${width},h_${width},c_fill,q_auto,f_auto/`
    );
  };

  const getTypeBadge = () => {
    if (mess.type === "veg") {
      return (
        <span
          style={{
            background: "#2e7d32",
            color: "white",
            fontSize: "11px",
            padding: "4px 10px",
            borderRadius: "20px",
            whiteSpace: "nowrap",
          }}
        >
          Veg
        </span>
      );
    } else if (mess.type === "non-veg") {
      return (
        <span
          style={{
            background: "#8b1e1e",
            color: "white",
            fontSize: "11px",
            padding: "4px 10px",
            borderRadius: "20px",
            whiteSpace: "nowrap",
          }}
        >
          Non-Veg
        </span>
      );
    } else {
      return (
        <span
          style={{
            background: "#8b1e1e",
            color: "white",
            fontSize: "11px",
            padding: "4px 10px",
            borderRadius: "20px",
            whiteSpace: "nowrap",
          }}
        >
          Veg + Non-Veg
        </span>
      );
    }
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "14px",
        marginBottom: "14px",
        border: "1px solid #eee",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "6px",
        }}
      >
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600" }}>{mess.name}</h3>
          <div
            style={{
              fontSize: "12px",
              color: "#777",
              marginTop: "4px",
              display: "flex",
              alignItems: "flex-start",
              gap: "4px",
            }}
          >
            <MapPin size={13} style={{ marginTop: "2px", flexShrink: 0 }} />
            <span>{mess.address}</span>
          </div>
          {mess.distance !== undefined && (
            <div
              style={{
                fontSize: "12px",
                color: "#059669",
                marginTop: "4px",
                fontWeight: "600",
              }}
            >
              🚶 {formatDistance(mess.distance)} away
            </div>
          )}
        </div>
        {getTypeBadge()}
      </div>

      {/* Menu Updated Badge */}
      {mess.menuUpdatedToday && (
        <div
          style={{
            display: "inline-block",
            background: "#d4edda",
            color: "#155724",
            padding: "3px 8px",
            borderRadius: "10px",
            fontSize: "10px",
            fontWeight: "600",
            marginTop: "6px",
          }}
        >
          ✓ Menu Updated
        </div>
      )}

      {/* Rating */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "10px",
          marginTop: "8px",
        }}
      >
        <Star
          size={15}
          style={{ fill: "#f4c430", color: "#f4c430", marginRight: "4px" }}
        />
        <span style={{ fontWeight: "bold", fontSize: "14px" }}>
          {mess.rating > 0 ? mess.rating : "New"}
        </span>
        {mess.totalRatings > 0 && (
          <span style={{ color: "#777", fontSize: "12px", marginLeft: "4px" }}>
            ({mess.totalRatings})
          </span>
        )}
      </div>

      {/* Price */}
      <div style={{ marginBottom: "12px" }}>
        <p style={{ fontSize: "18px", fontWeight: "bold" }}>
          ₹{mess.monthlyPrice} / month
        </p>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => navigate(`/mess/${mess.id}`)}
          style={{
            flex: 1,
            background: "#f4c430",
            border: "none",
            padding: "9px",
            fontSize: "13px",
            borderRadius: "8px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          View
        </button>
        <button
          onClick={() => (window.location.href = `tel:${mess.phone}`)}
          style={{
            flex: 1,
            background: "#eee",
            border: "none",
            padding: "9px",
            fontSize: "13px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Call
        </button>
      </div>
    </div>
  );
};

export default MessCard;

import { useNavigate } from "react-router-dom";

const MessCard = ({ mess }) => {
  const navigate = useNavigate();

  const getTypeBadge = () => {
    const baseStyle = {
      fontSize: "11px",
      padding: "4px 10px",
      borderRadius: "20px",
      color: "white",
      whiteSpace: "nowrap",
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
        <div style={{ fontSize: "16px", fontWeight: "600" }}>{mess.name}</div>
        {getTypeBadge()}
      </div>

      {/* Area */}
      <div
        style={{
          fontSize: "12px",
          color: "#777",
          marginBottom: "10px",
        }}
      >
        📍{mess.area}
      </div>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#8b1e1e",
          }}
        >
          ★ {mess.rating} ({mess.totalRatings})
        </div>
        <div
          style={{
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          ₹{mess.monthlyPrice} / month
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => navigate(`/mess/${mess.id}`)}
          style={{
            flex: 1,
            padding: "9px",
            fontSize: "13px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            background: "#f4c430",
            fontWeight: "600",
          }}
        >
          View
        </button>
        <button
          onClick={() => (window.location.href = `tel:${mess.phone}`)}
          style={{
            flex: 1,
            padding: "9px",
            fontSize: "13px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            background: "#eee",
          }}
        >
          Call
        </button>
      </div>
    </div>
  );
};

export default MessCard;

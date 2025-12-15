import { useState } from "react";
import { X } from "lucide-react";

const MenuUpdateModal = ({
  isOpen,
  onClose,
  mess,
  currentMenu,
  onUpdateSuccess,
}) => {
  const [menuData, setMenuData] = useState({
    breakfast: currentMenu?.breakfast || "",
    lunch: currentMenu?.lunch || "",
    dinner: currentMenu?.dinner || "",
  });
  const [privateKey, setPrivateKey] = useState("");
  const [step, setStep] = useState("menu"); // 'menu' or 'verify'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleMenuChange = (service, value) => {
    setMenuData((prev) => ({
      ...prev,
      [service]: value,
    }));
  };

  const handleContinue = () => {
    // Validate at least one service has menu
    const hasMenu = mess.services.some((service) => menuData[service]?.trim());

    if (!hasMenu) {
      setError("Please add menu for at least one service");
      return;
    }

    setError("");
    setStep("verify");
  };

  const handleUpdate = async () => {
    if (!privateKey.trim()) {
      setError("Please enter the private key");
      return;
    }

    // Verify private key
    if (privateKey.trim() !== mess.privateKey) {
      setError("Invalid private key!");
      return;
    }

    setLoading(true);
    setError("");

    // Call parent function to save menu
    const success = await onUpdateSuccess(menuData);

    setLoading(false);

    if (success) {
      resetAndClose();
    } else {
      setError("Failed to update menu. Please try again.");
    }
  };

  const resetAndClose = () => {
    setStep("menu");
    setMenuData({
      breakfast: currentMenu?.breakfast || "",
      lunch: currentMenu?.lunch || "",
      dinner: currentMenu?.dinner || "",
    });
    setPrivateKey("");
    setError("");
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          maxWidth: "500px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        {/* Close Button */}
        <button
          onClick={resetAndClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <X size={24} color="#777" />
        </button>

        {/* Menu Entry Step */}
        {step === "menu" && (
          <>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Update Today's Menu
            </h2>
            <p
              style={{ fontSize: "14px", color: "#777", marginBottom: "20px" }}
            >
              {mess.name}
            </p>

            {mess.services.map((service) => (
              <div key={service} style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    marginBottom: "6px",
                    color: "#555",
                    textTransform: "capitalize",
                  }}
                >
                  {service}
                </label>
                <input
                  type="text"
                  value={menuData[service]}
                  onChange={(e) => handleMenuChange(service, e.target.value)}
                  placeholder={`e.g., Dal, Rice, Roti, Sabzi`}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
              </div>
            ))}

            {error && (
              <p
                style={{
                  color: "#8b1e1e",
                  fontSize: "13px",
                  marginBottom: "12px",
                }}
              >
                {error}
              </p>
            )}

            <button
              onClick={handleContinue}
              style={{
                width: "100%",
                background: "#f4c430",
                border: "none",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Continue
            </button>
          </>
        )}

        {/* Private Key Verification Step */}
        {step === "verify" && (
          <>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Verify Private Key
            </h2>
            <p
              style={{ fontSize: "14px", color: "#777", marginBottom: "20px" }}
            >
              Enter your private key to update the menu
            </p>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "6px",
                  color: "#555",
                }}
              >
                Private Key
              </label>
              <input
                type="password"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Enter private key"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              />
            </div>

            {error && (
              <p
                style={{
                  color: "#8b1e1e",
                  fontSize: "13px",
                  marginBottom: "12px",
                }}
              >
                {error}
              </p>
            )}

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setStep("menu")}
                style={{
                  flex: 1,
                  background: "#eee",
                  border: "none",
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Back
              </button>
              <button
                onClick={handleUpdate}
                disabled={loading}
                style={{
                  flex: 1,
                  background: "#f4c430",
                  border: "none",
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MenuUpdateModal;

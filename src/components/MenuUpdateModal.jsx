import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";

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
    "pre-lunch": currentMenu?.["pre-lunch"] || "",
    "evening-snacks": currentMenu?.["evening-snacks"] || "",
    supper: currentMenu?.supper || "",
  });

  const [activeServices, setActiveServices] = useState([...mess.services]);
  const [showAddService, setShowAddService] = useState(false);
  const [privateKey, setPrivateKey] = useState("");
  const [step, setStep] = useState("menu"); // 'menu' or 'verify'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const availableServices = [
    { id: "breakfast", label: "Breakfast" },
    { id: "pre-lunch", label: "Pre-Lunch" },
    { id: "lunch", label: "Lunch" },
    { id: "evening-snacks", label: "Evening Snacks" },
    { id: "dinner", label: "Dinner" },
    { id: "supper", label: "Supper" },
  ];

  // Reset modal state when it opens
  useEffect(() => {
    if (isOpen) {
      // Reset to current mess services and menu
      setActiveServices([...mess.services]);
      setMenuData({
        breakfast: currentMenu?.breakfast || "",
        lunch: currentMenu?.lunch || "",
        dinner: currentMenu?.dinner || "",
        "pre-lunch": currentMenu?.["pre-lunch"] || "",
        "evening-snacks": currentMenu?.["evening-snacks"] || "",
        supper: currentMenu?.supper || "",
      });
      setStep("menu");
      setPrivateKey("");
      setError("");
      setShowAddService(false);
    }
  }, [isOpen, mess.services, currentMenu]);

  const remainingServices = availableServices.filter(
    (service) => !activeServices.includes(service.id)
  );

  if (!isOpen) return null;

  const handleMenuChange = (service, value) => {
    setMenuData((prev) => ({
      ...prev,
      [service]: value,
    }));
  };

  const handleAddService = (serviceId) => {
    setActiveServices((prev) => [...prev, serviceId]);
    setShowAddService(false);
    setError("");
  };

  const handleRemoveService = (serviceId) => {
    // Prevent removing if it's the last service
    if (activeServices.length === 1) {
      alert(
        "Cannot remove the last service. At least one service is required."
      );
      return;
    }

    setActiveServices((prev) => prev.filter((s) => s !== serviceId));
    // Clear menu data for removed service
    setMenuData((prev) => ({
      ...prev,
      [serviceId]: "",
    }));
    setError("");
  };

  const handleContinue = () => {
    // Validate at least one active service has menu
    const hasMenu = activeServices.some((service) => menuData[service]?.trim());

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

    // Filter only active services menu data (only services with content)
    const filteredMenuData = {};
    activeServices.forEach((service) => {
      if (menuData[service]?.trim()) {
        filteredMenuData[service] = menuData[service].trim();
      }
    });

    // Call parent function to save menu and services
    const success = await onUpdateSuccess(filteredMenuData, activeServices);

    setLoading(false);

    if (success) {
      alert("Menu and services updated successfully! ✅");
      resetAndClose();
    } else {
      setError("Failed to update menu. Please try again.");
    }
  };

  const resetAndClose = () => {
    setStep("menu");
    setActiveServices([...mess.services]);
    setPrivateKey("");
    setError("");
    setShowAddService(false);
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
            zIndex: 10,
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

            {activeServices.map((service) => (
              <div key={service} style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#555",
                      textTransform: "capitalize",
                    }}
                  >
                    {service.replace("-", " ")}
                  </label>
                  <button
                    onClick={() => handleRemoveService(service)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor:
                        activeServices.length > 1 ? "pointer" : "not-allowed",
                      color: activeServices.length > 1 ? "#8b1e1e" : "#ccc",
                      padding: "4px",
                      opacity: activeServices.length > 1 ? 1 : 0.5,
                    }}
                    title={
                      activeServices.length > 1
                        ? "Remove service"
                        : "Cannot remove last service"
                    }
                    disabled={activeServices.length === 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
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

            {/* Add Service Button */}
            {remainingServices.length > 0 && !showAddService && (
              <button
                onClick={() => setShowAddService(true)}
                style={{
                  width: "100%",
                  background: "#f0f0f0",
                  border: "1px dashed #ccc",
                  padding: "10px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#555",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  marginBottom: "16px",
                }}
              >
                <Plus size={18} />
                Add Service
              </button>
            )}

            {/* Service Selection */}
            {showAddService && (
              <div
                style={{
                  background: "#f9f9f9",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  border: "1px solid #e0e0e0",
                }}
              >
                <p
                  style={{
                    fontSize: "13px",
                    color: "#555",
                    marginBottom: "10px",
                    fontWeight: "600",
                  }}
                >
                  Select a service to add:
                </p>
                {remainingServices.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleAddService(service.id)}
                    style={{
                      width: "100%",
                      background: "white",
                      border: "1px solid #ddd",
                      padding: "10px",
                      borderRadius: "6px",
                      fontSize: "14px",
                      cursor: "pointer",
                      marginBottom: "6px",
                      textAlign: "left",
                    }}
                  >
                    {service.label}
                  </button>
                ))}
                <button
                  onClick={() => setShowAddService(false)}
                  style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    color: "#777",
                    fontSize: "13px",
                    cursor: "pointer",
                    marginTop: "6px",
                  }}
                >
                  Cancel
                </button>
              </div>
            )}

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
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleUpdate();
                  }
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
                onClick={() => {
                  setStep("menu");
                  setPrivateKey("");
                  setError("");
                }}
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

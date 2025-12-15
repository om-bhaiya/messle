import { useState } from "react";
import { X } from "lucide-react";
import {
  sendOTP,
  verifyOTP,
  saveUserProfile,
  getUserProfile,
} from "../services/auth";

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [step, setStep] = useState("phone"); // 'phone', 'otp', 'name'
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");

    if (phoneNumber.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    const result = await sendOTP(phoneNumber);
    setLoading(false);

    if (result.success) {
      setStep("otp");
    } else {
      setError(result.message);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    const result = await verifyOTP(otp);
    setLoading(false);

    if (result.success) {
      // Check if user already has a profile
      const profileResult = await getUserProfile(result.user.uid);

      if (profileResult.success && profileResult.data) {
        // User exists, login complete
        onLoginSuccess(result.user);
        resetAndClose();
      } else {
        // New user, ask for name
        setStep("name");
      }
    } else {
      setError(result.message);
    }
  };

  const handleSaveName = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    setLoading(true);
    const user = await getCurrentUser();
    const result = await saveUserProfile(user.uid, name, `+91${phoneNumber}`);
    setLoading(false);

    if (result.success) {
      onLoginSuccess(user);
      resetAndClose();
    } else {
      setError(result.message);
    }
  };

  const resetAndClose = () => {
    setStep("phone");
    setPhoneNumber("");
    setOtp("");
    setName("");
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
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          maxWidth: "400px",
          width: "90%",
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

        {/* Phone Step */}
        {step === "phone" && (
          <form onSubmit={handleSendOTP}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Login with Phone
            </h2>
            <p
              style={{ fontSize: "14px", color: "#777", marginBottom: "20px" }}
            >
              Enter your phone number to receive OTP
            </p>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  marginBottom: "6px",
                  color: "#555",
                }}
              >
                Phone Number
              </label>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span style={{ fontSize: "16px", color: "#555" }}>+91</span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) =>
                    setPhoneNumber(
                      e.target.value.replace(/\D/g, "").slice(0, 10)
                    )
                  }
                  placeholder="9876543210"
                  style={{
                    flex: 1,
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    fontSize: "16px",
                  }}
                  maxLength={10}
                  required
                />
              </div>
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

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
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
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* OTP Step */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOTP}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Enter OTP
            </h2>
            <p
              style={{ fontSize: "14px", color: "#777", marginBottom: "20px" }}
            >
              We sent a 6-digit code to +91{phoneNumber}
            </p>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  marginBottom: "6px",
                  color: "#555",
                }}
              >
                OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="123456"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  fontSize: "16px",
                  letterSpacing: "4px",
                  textAlign: "center",
                }}
                maxLength={6}
                required
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

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
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
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={() => setStep("phone")}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                marginTop: "12px",
                color: "#777",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Change phone number
            </button>
          </form>
        )}

        {/* Name Step */}
        {step === "name" && (
          <form onSubmit={handleSaveName}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              What's your name?
            </h2>
            <p
              style={{ fontSize: "14px", color: "#777", marginBottom: "20px" }}
            >
              This will be shown with your ratings
            </p>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  marginBottom: "6px",
                  color: "#555",
                }}
              >
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  fontSize: "16px",
                }}
                required
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

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
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
              {loading ? "Saving..." : "Continue"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginModal;

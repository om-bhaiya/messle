import { useState } from "react";
import { importMesses, importMenus } from "../utils/importData";

const ImportPage = () => {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    setLoading(true);
    setStatus("Importing messes...");

    const messResult = await importMesses();
    if (messResult.success) {
      setStatus("Messes imported! Now importing menus...");
      const menuResult = await importMenus();

      if (menuResult.success) {
        setStatus(
          "✅ All data imported successfully! You can close this page."
        );
      } else {
        setStatus(`❌ Menu import failed: ${menuResult.message}`);
      }
    } else {
      setStatus(`❌ Mess import failed: ${messResult.message}`);
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "500px",
        margin: "50px auto",
        background: "white",
        borderRadius: "12px",
        textAlign: "center",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>Firebase Data Import</h2>
      <p style={{ marginBottom: "20px", color: "#666" }}>
        Click the button below to import test data into Firestore
      </p>

      <button
        onClick={handleImport}
        disabled={loading}
        style={{
          background: "#f4c430",
          border: "none",
          padding: "12px 24px",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Importing..." : "Import Data"}
      </button>

      {status && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            background: "#f0f0f0",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        >
          {status}
        </div>
      )}
    </div>
  );
};

export default ImportPage;

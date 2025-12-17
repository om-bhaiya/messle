import { useState } from "react";
import { importMessesFromJSON } from "../utils/importMessesFromJSON";

const ImportPage = () => {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    setLoading(true);
    setStatus("Importing messes from JSON...");

    const result = await importMessesFromJSON();

    setLoading(false);

    if (result.success) {
      setStatus(`✅ Successfully imported ${result.count} messes!`);
    } else {
      setStatus(`❌ Import failed: ${result.message}`);
    }
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
      <h2 style={{ marginBottom: "20px" }}>Import Messes from JSON</h2>
      <p style={{ marginBottom: "20px", color: "#666" }}>
        Click to import 9 messes from JSON file
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
        {loading ? "Importing..." : "Import Messes"}
      </button>

      {status && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            background: "#f0f0f0",
            borderRadius: "8px",
            fontSize: "14px",
            whiteSpace: "pre-wrap",
          }}
        >
          {status}
        </div>
      )}
    </div>
  );
};

export default ImportPage;

import { useState, useEffect } from "react";
import { X, Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { uploadMessPhoto, deleteMessPhoto } from "../services/photos";

const PhotoManagementModal = ({ isOpen, onClose, mess, onUpdateSuccess }) => {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [privateKey, setPrivateKey] = useState("");
  const [step, setStep] = useState("manage"); // 'manage' or 'verify'
  const [pendingAction, setPendingAction] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && mess) {
      setPhotos(mess.photos || []);
      setStep("manage");
      setPrivateKey("");
      setError("");
    }
  }, [isOpen, mess]);

  if (!isOpen) return null;

  const MAX_PHOTOS = 5;

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    if (photos.length + files.length > MAX_PHOTOS) {
      setError(`Maximum ${MAX_PHOTOS} photos allowed`);
      return;
    }

    // Store files for later upload after key verification
    setPendingAction({
      type: "upload",
      files: files,
    });
    setStep("verify");
  };

  const handleDeletePhoto = (index) => {
    setPendingAction({
      type: "delete",
      index: index,
    });
    setStep("verify");
  };

  const handleVerifyAndExecute = async () => {
    if (!privateKey.trim()) {
      setError("Please enter the private key");
      return;
    }

    if (privateKey.trim() !== mess.privateKey) {
      setError("Invalid private key!");
      return;
    }

    setUploading(true);
    setError("");

    let success = false;

    if (pendingAction.type === "upload") {
      success = await handleUpload(pendingAction.files);
    } else if (pendingAction.type === "delete") {
      success = await handleDelete(pendingAction.index);
    }

    setUploading(false);

    if (success) {
      onClose();
      setTimeout(() => {
        alert("Photos updated successfully! ✅");
      }, 100);
    } else {
      setError("Failed to update photos. Please try again.");
    }
  };

  const handleUpload = async (files) => {
    try {
      const uploadPromises = files.map((file) =>
        uploadMessPhoto(mess.id, file)
      );
      const results = await Promise.all(uploadPromises);

      const successfulUploads = results
        .filter((r) => r.success)
        .map((r) => ({ url: r.url, publicId: r.publicId }));

      if (successfulUploads.length === 0) {
        return false;
      }

      const updatedPhotos = [...photos, ...successfulUploads];
      const result = await onUpdateSuccess(updatedPhotos);

      return result;
    } catch (error) {
      console.error("Error in handleUpload:", error);
      return false;
    }
  };

  const handleDelete = async (index) => {
    try {
      const photoToDelete = photos[index];

      // Delete from Cloudinary (optional for MVP)
      if (photoToDelete.publicId) {
        await deleteMessPhoto(photoToDelete.publicId);
      }

      const updatedPhotos = photos.filter((_, i) => i !== index);
      const result = await onUpdateSuccess(updatedPhotos);

      return result;
    } catch (error) {
      console.error("Error in handleDelete:", error);
      return false;
    }
  };

  const handleClose = () => {
    setStep("manage");
    setPrivateKey("");
    setError("");
    setPendingAction(null);
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
        <button
          onClick={handleClose}
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

        {step === "manage" && (
          <>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Manage Photos
            </h2>
            <p
              style={{ fontSize: "14px", color: "#777", marginBottom: "20px" }}
            >
              {mess.name} • Max {MAX_PHOTOS} photos
            </p>

            {/* Current Photos */}
            {photos.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "10px",
                  marginBottom: "20px",
                }}
              >
                {photos.map((photo, index) => (
                  <div
                    key={index}
                    style={{
                      position: "relative",
                      paddingBottom: "100%",
                      background: "#f0f0f0",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={typeof photo === "string" ? photo : photo.url}
                      alt={`Photo ${index + 1}`}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <button
                      onClick={() => handleDeletePhoto(index)}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: "rgba(139, 30, 30, 0.9)",
                        border: "none",
                        borderRadius: "50%",
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.background = "rgba(139, 30, 30, 1)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = "rgba(139, 30, 30, 0.9)")
                      }
                    >
                      <Trash2 size={16} color="white" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  background: "#f9f9f9",
                  borderRadius: "8px",
                  marginBottom: "20px",
                }}
              >
                <ImageIcon
                  size={48}
                  color="#ccc"
                  style={{ margin: "0 auto 12px" }}
                />
                <p style={{ color: "#999", fontSize: "14px" }}>No photos yet</p>
              </div>
            )}

            {/* Upload Button */}
            {photos.length < MAX_PHOTOS && (
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  background: "#f4c430",
                  padding: "12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                <Upload size={18} />
                Upload Photo{photos.length < MAX_PHOTOS - 1 ? "s" : ""}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />
              </label>
            )}

            <p
              style={{
                fontSize: "12px",
                color: "#999",
                marginTop: "12px",
                textAlign: "center",
              }}
            >
              {photos.length} / {MAX_PHOTOS} photos
            </p>
          </>
        )}

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
              Enter your private key to{" "}
              {pendingAction?.type === "upload" ? "upload" : "delete"} photo
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
                onKeyPress={(e) =>
                  e.key === "Enter" && handleVerifyAndExecute()
                }
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
                  setStep("manage");
                  setPrivateKey("");
                  setError("");
                  setPendingAction(null);
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
                onClick={handleVerifyAndExecute}
                disabled={uploading}
                style={{
                  flex: 1,
                  background: "#f4c430",
                  border: "none",
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: uploading ? "not-allowed" : "pointer",
                  opacity: uploading ? 0.6 : 1,
                }}
              >
                {uploading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PhotoManagementModal;

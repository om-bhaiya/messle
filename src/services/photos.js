import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

// Cloudinary upload URL - replace with YOUR cloud name
const CLOUDINARY_CLOUD_NAME = "dkv9k8agw"; // Replace this!
const CLOUDINARY_UPLOAD_PRESET = "messle-photos";

// Upload a photo to Cloudinary
export const uploadMessPhoto = async (messId, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", `mess-photos/${messId}`);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();

    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error("Error uploading photo:", error);
    return { success: false, message: error.message };
  }
};

// Delete a photo from Cloudinary
export const deleteMessPhoto = async (publicId) => {
  try {
    // Note: Deletion requires backend/signed request
    // For MVP, we'll just remove from Firestore
    // Cloudinary will clean up unused images eventually
    return { success: true };
  } catch (error) {
    console.error("Error deleting photo:", error);
    return { success: false, message: error.message };
  }
};

// Update mess photos array in Firestore
export const updateMessPhotos = async (messId, photos) => {
  try {
    const messRef = doc(db, "messes", messId);
    await updateDoc(messRef, {
      photos: photos,
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating mess photos:", error);
    return { success: false, message: error.message };
  }
};

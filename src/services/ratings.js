import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";

// Save a rating
export const saveRating = async (messId, rating) => {
  try {
    // Add rating to ratings collection
    await addDoc(collection(db, "ratings"), {
      messId,
      rating,
      createdAt: new Date(),
    });

    // Update mess average rating
    await updateMessRating(messId);

    // Store in localStorage to prevent duplicate ratings
    const ratedMesses = JSON.parse(localStorage.getItem("ratedMesses") || "{}");
    ratedMesses[messId] = rating;
    localStorage.setItem("ratedMesses", JSON.stringify(ratedMesses));

    return { success: true };
  } catch (error) {
    console.error("Error saving rating:", error);
    return { success: false, message: error.message };
  }
};

// Check if user already rated this mess
export const hasUserRated = (messId) => {
  const ratedMesses = JSON.parse(localStorage.getItem("ratedMesses") || "{}");
  return ratedMesses[messId] !== undefined;
};

// Get user's rating for a mess
export const getUserRating = (messId) => {
  const ratedMesses = JSON.parse(localStorage.getItem("ratedMesses") || "{}");
  return ratedMesses[messId] || 0;
};

// Update mess average rating
const updateMessRating = async (messId) => {
  try {
    // Get all ratings for this mess
    const ratingsQuery = query(
      collection(db, "ratings"),
      where("messId", "==", messId)
    );
    const snapshot = await getDocs(ratingsQuery);

    let totalRating = 0;
    let count = 0;

    snapshot.forEach((doc) => {
      totalRating += doc.data().rating;
      count++;
    });

    const averageRating = count > 0 ? (totalRating / count).toFixed(1) : 0;

    // Update mess document
    const messRef = doc(db, "messes", messId);
    await updateDoc(messRef, {
      rating: parseFloat(averageRating),
      totalRatings: count,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating mess rating:", error);
    return { success: false };
  }
};

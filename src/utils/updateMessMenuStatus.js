import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

// Update mess document with menu status (call this when menu is updated)
export const updateMessMenuStatus = async (messId, hasMenu) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const messRef = doc(db, "messes", messId);

    await updateDoc(messRef, {
      menuUpdatedToday: hasMenu,
      lastMenuUpdate: today,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating mess menu status:", error);
    return { success: false };
  }
};

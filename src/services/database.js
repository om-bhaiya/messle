import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "./firebase";

import { updateMessMenuStatus } from "../utils/updateMessMenuStatus";

// Fetch all messes
export const getAllMesses = async () => {
  try {
    const messesRef = collection(db, "messes");
    const snapshot = await getDocs(messesRef);

    const messes = [];
    snapshot.forEach((doc) => {
      messes.push({ id: doc.id, ...doc.data() });
    });

    return messes;
  } catch (error) {
    console.error("Error fetching messes:", error);
    return [];
  }
};

// Fetch messes by city
export const getMessesByCity = async (city) => {
  try {
    const messesRef = collection(db, "messes");
    const q = query(messesRef, where("city", "==", city));
    const snapshot = await getDocs(q);

    const messes = [];
    snapshot.forEach((doc) => {
      messes.push({ id: doc.id, ...doc.data() });
    });

    return messes;
  } catch (error) {
    console.error("Error fetching messes by city:", error);
    return [];
  }
};

// Fetch single mess by ID
export const getMessById = async (messId) => {
  try {
    const messRef = doc(db, "messes", messId);
    const messDoc = await getDoc(messRef);

    if (messDoc.exists()) {
      return { id: messDoc.id, ...messDoc.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching mess:", error);
    return null;
  }
};

// Fetch today's menu for a mess
export const getTodayMenu = async (messId) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const menuId = `menu_${messId}_${today}`;

    const menuRef = doc(db, "menus", menuId);
    const menuDoc = await getDoc(menuRef);

    if (menuDoc.exists()) {
      return { id: menuDoc.id, ...menuDoc.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching menu:", error);
    return null;
  }
};

// Update today's menu and services
export const updateTodayMenu = async (messId, menuData, services) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const menuId = `menu_${messId}_${today}`;
    const now = new Date();

    // Update menu
    const menuRef = doc(db, "menus", menuId);
    await setDoc(menuRef, {
      messId,
      date: today,
      ...menuData,
      updatedAt: now,
    });

    // Update mess services
    const messRef = doc(db, "messes", messId);
    await updateDoc(messRef, {
      services: services,
      menuUpdatedToday: true, // Add this flag
      lastMenuUpdate: today, // Add this field
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating menu:", error);
    return { success: false, message: error.message };
  }
};

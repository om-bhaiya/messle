import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// 1. Clean up old menus (older than 7 days)
export const cleanupOldMenus = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoString = sevenDaysAgo.toISOString().split("T")[0];

    const menusRef = collection(db, "menus");
    const q = query(menusRef, where("date", "<", sevenDaysAgoString));
    const snapshot = await getDocs(q);

    const deletePromises = [];
    snapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });

    await Promise.all(deletePromises);
    console.log(`✅ Deleted ${snapshot.size} old menus`);
    return { success: true, deleted: snapshot.size };
  } catch (error) {
    console.error("❌ Error cleaning up old menus:", error);
    return { success: false, error: error.message };
  }
};

// 2. Clean up old visitors (older than yesterday)
export const cleanupOldVisitors = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split("T")[0];

    const visitorsRef = collection(db, "dailyVisitors");
    const q = query(visitorsRef, where("date", "<", yesterdayString));
    const snapshot = await getDocs(q);

    const deletePromises = [];
    snapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });

    await Promise.all(deletePromises);
    console.log(`✅ Deleted ${snapshot.size} old visitor records`);
    return { success: true, deleted: snapshot.size };
  } catch (error) {
    console.error("❌ Error cleaning up old visitors:", error);
    return { success: false, error: error.message };
  }
};

// 3. Clean up inactive sessions (older than 10 minutes)
export const cleanupInactiveSessions = async () => {
  try {
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;

    const sessionsRef = collection(db, "activeSessions");
    const q = query(sessionsRef, where("timestamp", "<", tenMinutesAgo));
    const snapshot = await getDocs(q);

    const deletePromises = [];
    snapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });

    await Promise.all(deletePromises);
    console.log(`✅ Deleted ${snapshot.size} inactive sessions`);
    return { success: true, deleted: snapshot.size };
  } catch (error) {
    console.error("❌ Error cleaning up inactive sessions:", error);
    return { success: false, error: error.message };
  }
};

// 4. Run all cleanup tasks
export const runFullCleanup = async () => {
  console.log("🧹 Starting full database cleanup...");

  const results = {
    menus: await cleanupOldMenus(),
    visitors: await cleanupOldVisitors(),
    sessions: await cleanupInactiveSessions(),
  };

  const totalDeleted =
    (results.menus.deleted || 0) +
    (results.visitors.deleted || 0) +
    (results.sessions.deleted || 0);

  console.log(`✅ Full cleanup complete! Deleted ${totalDeleted} documents`);

  return {
    success: true,
    totalDeleted,
    details: results,
  };
};

// 5. Get database statistics
export const getDatabaseStats = async () => {
  try {
    const stats = {};

    // Count messes
    const messesSnapshot = await getDocs(collection(db, "messes"));
    stats.messes = messesSnapshot.size;

    // Count menus
    const menusSnapshot = await getDocs(collection(db, "menus"));
    stats.menus = menusSnapshot.size;

    // Count ratings
    const ratingsSnapshot = await getDocs(collection(db, "ratings"));
    stats.ratings = ratingsSnapshot.size;

    // Count daily visitors
    const visitorsSnapshot = await getDocs(collection(db, "dailyVisitors"));
    stats.dailyVisitors = visitorsSnapshot.size;

    // Count active sessions
    const sessionsSnapshot = await getDocs(collection(db, "activeSessions"));
    stats.activeSessions = sessionsSnapshot.size;

    return stats;
  } catch (error) {
    console.error("Error getting database stats:", error);
    return null;
  }
};

// Reset menu status for all messes (run at midnight)
export const resetAllMenuStatus = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split("T")[0];

    const messesRef = collection(db, "messes");
    const q = query(messesRef, where("lastMenuUpdate", "<=", yesterdayString));
    const snapshot = await getDocs(q);

    const updatePromises = [];
    snapshot.forEach((doc) => {
      updatePromises.push(
        updateDoc(doc.ref, {
          menuUpdatedToday: false,
        })
      );
    });

    await Promise.all(updatePromises);
    console.log(`✅ Reset menu status for ${snapshot.size} messes`);
    return { success: true, updated: snapshot.size };
  } catch (error) {
    console.error("❌ Error resetting menu status:", error);
    return { success: false, error: error.message };
  }
};

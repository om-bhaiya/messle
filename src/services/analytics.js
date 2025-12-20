import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  serverTimestamp,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "./firebase";

// Generate a unique user ID (stored in localStorage)
const getUserId = () => {
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("userId", userId);
  }
  return userId;
};

// Get today's date string (YYYY-MM-DD)
const getTodayDateString = () => {
  return new Date().toISOString().split("T")[0];
};

// Cache keys
const CACHE_KEYS = {
  VISITOR_COUNT: "cachedVisitorCount",
  ACTIVE_COUNT: "cachedActiveCount",
  LAST_UPDATE: "cacheLastUpdate",
};

// Cache duration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Check if cache is valid
const isCacheValid = () => {
  const lastUpdate = localStorage.getItem(CACHE_KEYS.LAST_UPDATE);
  if (!lastUpdate) return false;

  const cacheAge = Date.now() - parseInt(lastUpdate);
  return cacheAge < CACHE_DURATION;
};

// Get cached counts
const getCachedCounts = () => {
  if (!isCacheValid()) return null;

  return {
    visitors: parseInt(localStorage.getItem(CACHE_KEYS.VISITOR_COUNT) || "0"),
    active: parseInt(localStorage.getItem(CACHE_KEYS.ACTIVE_COUNT) || "0"),
  };
};

// Set cached counts
const setCachedCounts = (visitors, active) => {
  localStorage.setItem(CACHE_KEYS.VISITOR_COUNT, visitors.toString());
  localStorage.setItem(CACHE_KEYS.ACTIVE_COUNT, active.toString());
  localStorage.setItem(CACHE_KEYS.LAST_UPDATE, Date.now().toString());
};

// Track visitor - NON-BLOCKING (runs in background)
export const trackVisitor = async () => {
  // Run asynchronously without blocking page load
  setTimeout(async () => {
    try {
      const userId = getUserId();
      const today = getTodayDateString();
      const visitorId = `visitor_${userId}_${today}`;

      // Check if already tracked today (avoid duplicate writes)
      const alreadyTracked =
        localStorage.getItem(`tracked_${today}`) === "true";

      if (!alreadyTracked) {
        // Record today's unique visit
        const visitorRef = doc(db, "dailyVisitors", visitorId);
        await setDoc(
          visitorRef,
          {
            userId,
            date: today,
            firstVisit: serverTimestamp(),
            lastSeen: serverTimestamp(),
          },
          { merge: true }
        );

        // Mark as tracked
        localStorage.setItem(`tracked_${today}`, "true");
      }

      // Record active session
      const sessionRef = doc(db, "activeSessions", userId);
      await setDoc(sessionRef, {
        userId,
        lastSeen: serverTimestamp(),
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Error tracking visitor:", error);
    }
  }, 100); // Delay 100ms to not block page load

  return { success: true };
};

// Update last seen timestamp (call this periodically)
export const updatePresence = async () => {
  try {
    const userId = getUserId();
    const sessionRef = doc(db, "activeSessions", userId);

    await setDoc(
      sessionRef,
      {
        lastSeen: serverTimestamp(),
        timestamp: Date.now(),
      },
      { merge: true }
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating presence:", error);
    return { success: false };
  }
};

// Get total unique visitors today (WITH CACHING)
export const getTodayVisitorCount = async () => {
  try {
    // Check cache first
    const cached = getCachedCounts();
    if (cached) {
      return cached.visitors;
    }

    // If no cache, fetch from Firebase
    const today = getTodayDateString();
    const visitorsRef = collection(db, "dailyVisitors");
    const q = query(visitorsRef, where("date", "==", today));

    // Use getCountFromServer for faster count (doesn't download documents)
    const snapshot = await getCountFromServer(q);
    const count = snapshot.data().count;

    return count;
  } catch (error) {
    console.error("Error getting visitor count:", error);
    return 0;
  }
};

// Get currently active users (WITH CACHING)
export const getActiveUsersCount = async () => {
  try {
    // Check cache first
    const cached = getCachedCounts();
    if (cached) {
      return cached.active;
    }

    // If no cache, fetch from Firebase
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const sessionsRef = collection(db, "activeSessions");
    const q = query(sessionsRef, where("timestamp", ">=", fiveMinutesAgo));

    // Use getCountFromServer for faster count
    const snapshot = await getCountFromServer(q);
    const count = snapshot.data().count;

    return count;
  } catch (error) {
    console.error("Error getting active users:", error);
    return 0;
  }
};

// Fetch and cache counts (call this less frequently)
export const fetchAndCacheCounts = async () => {
  try {
    const today = getTodayDateString();
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    // Fetch both counts in parallel
    const [visitorsSnapshot, sessionsSnapshot] = await Promise.all([
      getCountFromServer(
        query(collection(db, "dailyVisitors"), where("date", "==", today))
      ),
      getCountFromServer(
        query(
          collection(db, "activeSessions"),
          where("timestamp", ">=", fiveMinutesAgo)
        )
      ),
    ]);

    const visitors = visitorsSnapshot.data().count;
    const active = sessionsSnapshot.data().count;

    // Cache the results
    setCachedCounts(visitors, active);

    return { visitors, active };
  } catch (error) {
    console.error("Error fetching counts:", error);
    return null;
  }
};

// Clean up old sessions (call this periodically or via Cloud Function)
export const cleanupOldSessions = async () => {
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
    return { success: true, deleted: snapshot.size };
  } catch (error) {
    console.error("Error cleaning up sessions:", error);
    return { success: false };
  }
};

// Clean up yesterday's visitors (optional - keeps database lean)
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
    return { success: true, deleted: snapshot.size };
  } catch (error) {
    console.error("Error cleaning up old visitors:", error);
    return { success: false };
  }
};

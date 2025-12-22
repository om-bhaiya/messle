import { getToken, onMessage } from "./firebase";
import { messaging } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

// VAPID Key - Replace with YOUR key from Firebase Console
const VAPID_KEY =
  "BGTZaeNQJhlLC_c1ENtap4kbPvDsMtzVbyd8iLmwScbP8ZeAPLb4fDRljvbKjNULhzR4awhvWNHP2RzGsjt5ufQ";

// Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    console.log("[Notifications] Starting permission request...");

    // Check if notifications are supported
    if (!("Notification" in window)) {
      console.error("[Notifications] Not supported");
      return {
        success: false,
        message: "Notifications not supported in this browser",
      };
    }

    // Check if messaging is available
    if (!messaging) {
      console.error("[Notifications] Messaging not available");
      return {
        success: false,
        message: "Firebase Messaging not available",
      };
    }

    console.log("[Notifications] Requesting permission...");

    // Request permission
    const permission = await Notification.requestPermission();
    console.log("[Notifications] Permission result:", permission);

    if (permission === "granted") {
      console.log(
        "[Notifications] Permission granted, registering service worker..."
      );

      // Register service worker
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        { scope: "/" }
      );

      console.log("[Notifications] Service worker registered:", registration);

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log("[Notifications] Service worker ready");

      console.log("[Notifications] Getting FCM token...");

      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      console.log("[Notifications] FCM Token:", token);

      if (token) {
        // Save token to Firestore
        await saveNotificationToken(token);

        // Set up foreground message handler
        setupForegroundMessageHandler();

        // Test notification
        console.log("[Notifications] Showing test notification...");
        new Notification("Messle Notifications Enabled! 🎉", {
          body: "You will now receive daily menu updates",
          icon: "/messle-icon.png",
        });

        return { success: true, token };
      } else {
        console.error("[Notifications] No token received");
        return { success: false, message: "Failed to get token" };
      }
    } else {
      console.log("[Notifications] Permission denied");
      return { success: false, message: "Permission denied" };
    }
  } catch (error) {
    console.error("[Notifications] Error:", error);
    return { success: false, message: error.message };
  }
};

// Save notification token to Firestore
const saveNotificationToken = async (token) => {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.log("[Notifications] No userId found, skipping token save");
      return;
    }

    const tokenRef = doc(db, "notificationTokens", userId);
    await setDoc(
      tokenRef,
      {
        token,
        userId,
        createdAt: new Date(),
        lastUpdated: new Date(),
      },
      { merge: true }
    );

    localStorage.setItem("fcmToken", token);
    console.log("[Notifications] Token saved successfully");
  } catch (error) {
    console.error("[Notifications] Error saving token:", error);
  }
};

// Setup foreground message handler
const setupForegroundMessageHandler = () => {
  if (!messaging) return;

  console.log("[Notifications] Setting up foreground handler...");

  onMessage(messaging, (payload) => {
    console.log("[Notifications] Foreground message received:", payload);

    const notificationTitle = payload.notification?.title || "Messle";
    const notificationOptions = {
      body: payload.notification?.body || "New update from Messle",
      icon: "/messle-icon.png",
      badge: "/messle-badge.png",
      tag: "messle-notification",
    };

    if (Notification.permission === "granted") {
      new Notification(notificationTitle, notificationOptions);
    }
  });
};

// Check if user has granted notification permission
export const hasNotificationPermission = () => {
  if (!("Notification" in window)) return false;
  return Notification.permission === "granted";
};

// Check if user has denied notification permission
export const hasNotificationDenied = () => {
  if (!("Notification" in window)) return false;
  return Notification.permission === "denied";
};

// Get notification permission status
export const getNotificationStatus = () => {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
};

// Unsubscribe from notifications
export const unsubscribeFromNotifications = async () => {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const tokenRef = doc(db, "notificationTokens", userId);
    await setDoc(
      tokenRef,
      {
        token: null,
        unsubscribed: true,
        lastUpdated: new Date(),
      },
      { merge: true }
    );

    localStorage.removeItem("fcmToken");
    console.log("[Notifications] Unsubscribed successfully");

    return { success: true };
  } catch (error) {
    console.error("[Notifications] Error unsubscribing:", error);
    return { success: false, message: error.message };
  }
};

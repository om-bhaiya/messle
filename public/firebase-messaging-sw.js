// Combined Service Worker - Handles both caching AND Firebase notifications
console.log("[SW] Service Worker file loaded");

// ============================================
// PART 1: FIREBASE MESSAGING
// ============================================

importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

console.log("[SW] Firebase scripts imported");

// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyDlJiARBymCJHf1auIp8Eprpx1KlJprsro",
  authDomain: "mee-f4415.firebaseapp.com",
  projectId: "mee-f4415",
  storageBucket: "mee-f4415.firebasestorage.app",
  messagingSenderId: "638661788742",
  appId: "1:638661788742:web:31d41777287207a4b9f647",
});

console.log("[SW] Firebase initialized");

const messaging = firebase.messaging();
console.log("[SW] Messaging initialized");

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Received background message:", payload);

  const notificationTitle = payload.notification?.title || "Messle";
  const notificationOptions = {
    body: payload.notification?.body || "New update from Messle",
    icon: "/messle-icon.png",
    badge: "/messle-badge.png",
    tag: "messle-notification",
    requireInteraction: false,
    data: payload.data,
  };

  console.log("[SW] Showing notification:", notificationTitle);

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event);
  event.notification.close();

  event.waitUntil(clients.openWindow("http://localhost:5173"));
});

// ============================================
// PART 2: CACHING (Static Assets)
// ============================================

const CACHE_NAME = "messle-v1";
const urlsToCache = ["/", "/index.html"];

// Install service worker
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching static assets");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Fetch from cache first, then network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control immediately
});

console.log("[SW] Service Worker setup complete");

import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDlJiARBymCJHf1auIp8Eprpx1KlJprsro",
  authDomain: "mee-f4415.firebaseapp.com",
  projectId: "mee-f4415",
  storageBucket: "mee-f4415.firebasestorage.app",
  messagingSenderId: "638661788742",
  appId: "1:638661788742:web:31d41777287207a4b9f647",
  measurementId: "G-MV6QP9E0CC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db, {
  synchronizeTabs: true,
}).catch((err) => {
  if (err.code === "failed-precondition") {
    console.log("Persistence failed: Multiple tabs open");
  } else if (err.code === "unimplemented") {
    console.log("Persistence not available");
  }
});

// Initialize Auth
export const auth = getAuth(app);

// Initialize Messaging (only in supported browsers)
let messaging = null;
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.log("Messaging not supported:", error);
  }
}

export { messaging, getToken, onMessage };
export default app;

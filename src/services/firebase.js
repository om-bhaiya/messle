import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Replace this with YOUR Firebase config from Step 3
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

// Initialize Auth
export const auth = getAuth(app);

export default app;

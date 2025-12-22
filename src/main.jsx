import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register COMBINED service worker (handles both caching AND notifications)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js") // Changed from /sw.js
      .then((registration) => {
        console.log("✅ SW registered:", registration);
      })
      .catch((error) => {
        console.log("❌ SW registration failed:", error);
      });
  });
}

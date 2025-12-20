import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Lazy load pages
const HomePage = lazy(() => import("./pages/HomePage"));
const MessDetailPage = lazy(() => import("./pages/MessDetailPage"));
const ImportPage = lazy(() => import("./pages/ImportPage"));
const StatsPage = lazy(() => import("./pages/StatsPage"));

// Loading component
const PageLoader = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "#f7f5f2",
    }}
  >
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "4px solid #f4c430",
          borderTop: "4px solid transparent",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 12px",
        }}
      />
      <p style={{ color: "#3b2f2f", fontSize: "14px" }}>Loading...</p>
    </div>
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/mess/:messId" element={<MessDetailPage />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

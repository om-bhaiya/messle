import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MessDetailPage from "./pages/MessDetailPage";
import ImportPage from "./pages/ImportPage";
import StatsPage from "./pages/StatsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mess/:messId" element={<MessDetailPage />} />
        <Route path="/import" element={<ImportPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
    </Router>
  );
}

export default App;

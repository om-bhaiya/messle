import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MessDetailPage from "./pages/MessDetailPage";
import ImportPage from "./pages/ImportPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mess/:messId" element={<MessDetailPage />} />
        <Route path="/import" element={<ImportPage />} />
      </Routes>
    </Router>
  );
}

export default App;

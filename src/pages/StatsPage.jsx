import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Database, Trash2 } from "lucide-react";
import {
  getTodayVisitorCount,
  getActiveUsersCount,
} from "../services/analytics";
import {
  runFullCleanup,
  getDatabaseStats,
  cleanupOldMenus,
  cleanupOldVisitors,
  cleanupInactiveSessions,
} from "../services/databaseCleanup";

import { fetchAndCacheCounts } from "../services/analytics";

const StatsPage = () => {
  const navigate = useNavigate();
  const [todayVisitors, setTodayVisitors] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [dbStats, setDbStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cleanupLoading, setCleanupLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);

    // Fetch fresh counts
    const counts = await fetchAndCacheCounts();
    const stats = await getDatabaseStats();

    if (counts) {
      setTodayVisitors(counts.visitors);
      setActiveUsers(counts.active);
    }

    setDbStats(stats);
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchStats, 10 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFullCleanup = async () => {
    if (
      window.confirm(
        "This will delete:\n• Menus older than 7 days\n• Visitor records from yesterday\n• Inactive sessions (>10 min)\n\nContinue?"
      )
    ) {
      setCleanupLoading(true);
      const result = await runFullCleanup();
      setCleanupLoading(false);

      if (result.success) {
        alert(
          `✅ Cleanup complete!\n\nDeleted ${
            result.totalDeleted
          } documents:\n• ${result.details.menus.deleted || 0} old menus\n• ${
            result.details.visitors.deleted || 0
          } old visitors\n• ${
            result.details.sessions.deleted || 0
          } inactive sessions`
        );
        fetchStats(); // Refresh stats
      } else {
        alert("❌ Cleanup failed. Check console for errors.");
      }
    }
  };

  const handleMenuCleanup = async () => {
    if (window.confirm("Delete menus older than 7 days?")) {
      setCleanupLoading(true);
      const result = await cleanupOldMenus();
      setCleanupLoading(false);

      if (result.success) {
        alert(`✅ Deleted ${result.deleted} old menus`);
        fetchStats();
      }
    }
  };

  const handleVisitorCleanup = async () => {
    if (window.confirm("Delete visitor records from yesterday?")) {
      setCleanupLoading(true);
      const result = await cleanupOldVisitors();
      setCleanupLoading(false);

      if (result.success) {
        alert(`✅ Deleted ${result.deleted} old visitor records`);
        fetchStats();
      }
    }
  };

  const handleSessionCleanup = async () => {
    if (window.confirm("Delete inactive sessions (>10 minutes)?")) {
      setCleanupLoading(true);
      const result = await cleanupInactiveSessions();
      setCleanupLoading(false);

      if (result.success) {
        alert(`✅ Deleted ${result.deleted} inactive sessions`);
        fetchStats();
      }
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#f7f5f2",
        }}
      >
        <p>Loading stats...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#f7f5f2",
        minHeight: "100vh",
        color: "#3b2f2f",
      }}
    >
      {/* Header */}
      <div
        style={{ background: "#3b2f2f", color: "white", padding: "14px 16px" }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
            padding: "0",
            marginBottom: "8px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <ArrowLeft size={20} />
          <span style={{ fontSize: "14px" }}>Back</span>
        </button>
        <h1 style={{ fontSize: "20px", fontWeight: "600" }}>
          Analytics & Database
        </h1>
      </div>

      <div style={{ padding: "20px" }}>
        {/* Analytics Stats */}
        <h2
          style={{
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "12px",
          }}
        >
          Analytics
        </h2>

        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "48px",
              fontWeight: "700",
              color: "#3b2f2f",
              marginBottom: "8px",
            }}
          >
            {todayVisitors}
          </h2>
          <p style={{ fontSize: "14px", color: "#777" }}>
            Unique visitors today
          </p>
        </div>

        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "48px",
              fontWeight: "700",
              color: "#4ade80",
              marginBottom: "8px",
            }}
          >
            {activeUsers}
          </h2>
          <p style={{ fontSize: "14px", color: "#777" }}>
            Users online now
            <br />
            <span style={{ fontSize: "12px", opacity: 0.7 }}>
              (active in last 5 minutes)
            </span>
          </p>
        </div>

        {/* Database Stats */}
        <h2
          style={{
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "12px",
          }}
        >
          Database Storage
        </h2>

        {dbStats && (
          <div
            style={{
              background: "white",
              padding: "16px",
              borderRadius: "12px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              <Database size={20} color="#3b2f2f" />
              <h3 style={{ fontSize: "15px", fontWeight: "600" }}>
                Document Counts
              </h3>
            </div>

            <div style={{ fontSize: "14px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <span>Messes</span>
                <span style={{ fontWeight: "600" }}>{dbStats.messes}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <span>Menus</span>
                <span style={{ fontWeight: "600", color: "#f59e0b" }}>
                  {dbStats.menus}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <span>Ratings</span>
                <span style={{ fontWeight: "600" }}>{dbStats.ratings}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <span>Daily Visitors</span>
                <span style={{ fontWeight: "600", color: "#f59e0b" }}>
                  {dbStats.dailyVisitors}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                }}
              >
                <span>Active Sessions</span>
                <span style={{ fontWeight: "600", color: "#f59e0b" }}>
                  {dbStats.activeSessions}
                </span>
              </div>
            </div>

            <p
              style={{
                fontSize: "11px",
                color: "#999",
                marginTop: "12px",
                textAlign: "center",
              }}
            >
              🟠 Orange = needs regular cleanup
            </p>
          </div>
        )}

        {/* Cleanup Actions */}
        <h2
          style={{
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "12px",
          }}
        >
          Database Cleanup
        </h2>

        <div
          style={{
            background: "white",
            padding: "16px",
            borderRadius: "12px",
            marginBottom: "12px",
          }}
        >
          <button
            onClick={handleFullCleanup}
            disabled={cleanupLoading}
            style={{
              width: "100%",
              background: "#f4c430",
              border: "none",
              padding: "14px",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: cleanupLoading ? "not-allowed" : "pointer",
              opacity: cleanupLoading ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <Trash2 size={18} />
            {cleanupLoading ? "Cleaning..." : "Run Full Cleanup"}
          </button>
          <p
            style={{
              fontSize: "12px",
              color: "#777",
              marginTop: "10px",
              textAlign: "center",
            }}
          >
            Deletes old menus (7+ days), old visitors, and inactive sessions
          </p>
        </div>

        {/* Individual Cleanup Options */}
        <div
          style={{
            background: "white",
            padding: "16px",
            borderRadius: "12px",
          }}
        >
          <h3
            style={{
              fontSize: "14px",
              fontWeight: "600",
              marginBottom: "12px",
              color: "#777",
            }}
          >
            Individual Cleanup
          </h3>

          <button
            onClick={handleMenuCleanup}
            disabled={cleanupLoading}
            style={{
              width: "100%",
              background: "#f0f0f0",
              border: "none",
              padding: "10px",
              borderRadius: "8px",
              fontSize: "13px",
              cursor: cleanupLoading ? "not-allowed" : "pointer",
              marginBottom: "8px",
            }}
          >
            Clean Old Menus (7+ days)
          </button>

          <button
            onClick={handleVisitorCleanup}
            disabled={cleanupLoading}
            style={{
              width: "100%",
              background: "#f0f0f0",
              border: "none",
              padding: "10px",
              borderRadius: "8px",
              fontSize: "13px",
              cursor: cleanupLoading ? "not-allowed" : "pointer",
              marginBottom: "8px",
            }}
          >
            Clean Old Visitors (Yesterday)
          </button>

          <button
            onClick={handleSessionCleanup}
            disabled={cleanupLoading}
            style={{
              width: "100%",
              background: "#f0f0f0",
              border: "none",
              padding: "10px",
              borderRadius: "8px",
              fontSize: "13px",
              cursor: cleanupLoading ? "not-allowed" : "pointer",
            }}
          >
            Clean Inactive Sessions (10+ min)
          </button>
        </div>

        {/* Maintenance Schedule */}
        <div
          style={{
            background: "#fff9e6",
            padding: "16px",
            borderRadius: "12px",
            marginTop: "16px",
            border: "1px solid #f4c430",
          }}
        >
          <h3
            style={{
              fontSize: "14px",
              fontWeight: "600",
              marginBottom: "10px",
              color: "#3b2f2f",
            }}
          >
            📅 Recommended Cleanup Schedule
          </h3>
          <ul
            style={{
              fontSize: "12px",
              color: "#555",
              lineHeight: "1.8",
              paddingLeft: "20px",
            }}
          >
            <li>
              <strong>Daily:</strong> Clean old visitors (keeps today's count
              accurate)
            </li>
            <li>
              <strong>Hourly:</strong> Clean inactive sessions (auto-runs every
              10 min on homepage)
            </li>
            <li>
              <strong>Weekly:</strong> Clean old menus (keeps database lean)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;

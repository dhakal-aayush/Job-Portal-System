import { useState, useEffect } from "react";
import { getRecommendationAnalytics } from "../../services/adminService";
import { useToast } from "../../components/common/Toast";
import Loader from "../../components/common/Loader";
import "../jobseeker/Dashboard.css";

function Reports() {
  const { showToast } = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getRecommendationAnalytics();
        setAnalytics(data);
      } catch (err) {
        showToast(err.response?.data?.detail || "Failed to load analytics", "error");
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <Loader />;
  if (!analytics) return null;

  return (
    <div className="dashboard-page container">
      <h1 className="page-title">Recommendation Analytics</h1>
      <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
        Overview of the AI recommendation system's activity across the platform.
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{analytics.total_jobs}</span>
          <span className="stat-label">Total Jobs</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{analytics.open_jobs}</span>
          <span className="stat-label">Open Jobs</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{analytics.total_applications}</span>
          <span className="stat-label">Total Applications</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{analytics.scored_applications}</span>
          <span className="stat-label">AI-Scored Applications</span>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: "1fr" }}>
        <div className="stat-card">
          <span className="stat-value">{analytics.average_match_score}%</span>
          <span className="stat-label">Average AI Match Score</span>
        </div>
      </div>
    </div>
  );
}

export default Reports;

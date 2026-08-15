import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { getMyApplications, getSavedJobs } from "../../services/applicationService";
import { getRecommendations } from "../../services/recommendationService";
import JobCard from "../../components/jobs/JobCard";
import Loader from "../../components/common/Loader";
import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ apps: 0, saved: 0 });
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([getMyApplications(), getSavedJobs(), getRecommendations(3)])
      .then(([apps, saved, rec]) => {
        setStats({
          apps: apps.status === "fulfilled" ? apps.value.length : 0,
          saved: saved.status === "fulfilled" ? saved.value.length : 0,
        });
        if (rec.status === "fulfilled") {
          // Only show meaningful matches — 0% means no profile data yet
          setRecs((rec.value.recommendations || []).filter(r => r.score > 0));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="seeker-page container">
      <h1 className="page-title">Welcome back, {user?.name}</h1>

      <div className="stats-grid">
        {[
          { label: "Applications", value: stats.apps, to: "/applications" },
          { label: "Saved Jobs", value: stats.saved, to: "/saved-jobs" },
          { label: "Upload Resume", icon: "📄", to: "/resume" },
          { label: "Edit Profile", icon: "👤", to: "/profile" },
        ].map(s => (
          <Link key={s.label} to={s.to} className="stat-card">
            {s.value !== undefined ? <span className="stat-value">{s.value}</span> : <span className="stat-icon">{s.icon}</span>}
            <span className="stat-label">{s.label}</span>
          </Link>
        ))}
      </div>

      <div className="dash-section">
        <div className="dash-section-header">
          <h2>AI Recommendations</h2>
          <Link to="/recommendations" className="auth-link" style={{color:"var(--primary)",fontWeight:600,fontSize:"0.9rem"}}>View all</Link>
        </div>
        {recs.length === 0 ? (
          <div className="empty-state">
            <p>No recommendations yet. <Link to="/resume" style={{color:"var(--primary)"}}>Upload a resume</Link> to get started.</p>
          </div>
        ) : (
          <div className="job-list">{recs.map(r => <JobCard key={r.job_id} job={r} score={r.score} />)}</div>
        )}
      </div>
    </div>
  );
}
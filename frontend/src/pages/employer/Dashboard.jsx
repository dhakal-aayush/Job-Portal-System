import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { getEmployerJobs } from "../../services/employerService";
import Loader from "../../components/common/Loader";
import "../jobseeker/Dashboard.css";
import "./Dashboard.css";

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getEmployerJobs();
        setJobs(data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <Loader />;

  const openJobs = jobs.filter((j) => j.status === "open").length;
  const closedJobs = jobs.length - openJobs;

  return (
    <div className="dashboard-page container">
      <h1 className="page-title">Welcome, {user?.name}</h1>

      <div className="stats-grid">
        <Link to="/manage-jobs" className="stat-card">
          <span className="stat-value">{jobs.length}</span>
          <span className="stat-label">Total Jobs Posted</span>
        </Link>
        <Link to="/manage-jobs" className="stat-card">
          <span className="stat-value">{openJobs}</span>
          <span className="stat-label">Open Positions</span>
        </Link>
        <Link to="/manage-jobs" className="stat-card">
          <span className="stat-value">{closedJobs}</span>
          <span className="stat-label">Closed Positions</span>
        </Link>
        <Link to="/post-job" className="stat-card">
          <span className="stat-icon">➕</span>
          <span className="stat-label">Post New Job</span>
        </Link>
      </div>

      <section className="dashboard-section">
        <div className="section-header">
          <h2>Recent Job Postings</h2>
          <Link to="/manage-jobs" className="auth-link">Manage all</Link>
        </div>

        {jobs.length === 0 ? (
          <div className="empty-state">
            <p>
              You haven't posted any jobs yet.{" "}
              <Link to="/post-job" className="auth-link">Post your first job</Link>
            </p>
          </div>
        ) : (
          <div className="recent-jobs-list">
            {jobs.slice(0, 5).map((job) => (
              <div key={job.id} className="recent-job-row">
                <div>
                  <Link to={`/jobs/${job.id}`} className="auth-link">{job.title}</Link>
                  <span className="text-muted"> · {job.location}</span>
                </div>
                <Link to={`/applicants/${job.id}`} className="btn btn-outline btn-sm">
                  View Applicants
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;

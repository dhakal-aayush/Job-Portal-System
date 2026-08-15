import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUsers, getCompanies, getAllJobsForAdmin, getRecommendationAnalytics } from "../../services/adminService";
import { useToast } from "../../components/common/Toast";
import Loader from "../../components/common/Loader";
import "../jobseeker/Dashboard.css";
import "../employer/Dashboard.css";
import "./Admin.css";

function Dashboard() {
  const { showToast } = useToast();
  const [stats, setStats] = useState({ users: 0, companies: 0, jobs: 0, applications: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [users, companies, jobs, analytics] = await Promise.allSettled([
          getUsers(),
          getCompanies(),
          getAllJobsForAdmin(),
          getRecommendationAnalytics(),
        ]);

        setStats({
          users: users.status === "fulfilled" ? users.value.length : 0,
          companies: companies.status === "fulfilled" ? companies.value.length : 0,
          jobs: jobs.status === "fulfilled" ? jobs.value.total : 0,
          applications: analytics.status === "fulfilled" ? analytics.value.total_applications : 0,
        });
      } catch (err) {
        showToast(err.response?.data?.detail || "Failed to load admin stats", "error");
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="dashboard-page container">
      <h1 className="page-title">Admin Panel</h1>

      <div className="stats-grid">
        <Link to="/admin/users" className="stat-card">
          <span className="stat-value">{stats.users}</span>
          <span className="stat-label">Total Users</span>
        </Link>
        <Link to="/admin/companies" className="stat-card">
          <span className="stat-value">{stats.companies}</span>
          <span className="stat-label">Companies</span>
        </Link>
        <Link to="/admin/jobs" className="stat-card">
          <span className="stat-value">{stats.jobs}</span>
          <span className="stat-label">Job Postings</span>
        </Link>
        <Link to="/admin/reports" className="stat-card">
          <span className="stat-value">{stats.applications}</span>
          <span className="stat-label">Applications</span>
        </Link>
      </div>

      <section className="dashboard-section">
        <div className="section-header">
          <h2>Quick Actions</h2>
        </div>
        <div className="recent-jobs-list">
          <Link to="/admin/users" className="recent-job-row">
            <span>Manage Users</span>
            <span className="auth-link">Go →</span>
          </Link>
          <Link to="/admin/companies" className="recent-job-row">
            <span>Manage Companies</span>
            <span className="auth-link">Go →</span>
          </Link>
          <Link to="/admin/jobs" className="recent-job-row">
            <span>Monitor Job Postings</span>
            <span className="auth-link">Go →</span>
          </Link>
          <Link to="/admin/reports" className="recent-job-row">
            <span>Recommendation Analytics</span>
            <span className="auth-link">Go →</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;

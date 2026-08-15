import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllJobsForAdmin, deleteJobAsAdmin } from "../../services/adminService";
import { useToast } from "../../components/common/Toast";
import Loader from "../../components/common/Loader";
import "../jobseeker/Applications.css";
import "./Admin.css";

function Jobs() {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await getAllJobsForAdmin();
      setJobs(data.items);
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to load jobs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (jobId) => {
    try {
      await deleteJobAsAdmin(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      showToast("Job deleted", "success");
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to delete job", "error");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="applicants-page container">
      <h1 className="page-title">All Job Postings</h1>

      {jobs.length === 0 ? (
        <div className="empty-state"><p>No jobs found.</p></div>
      ) : (
        <div className="applications-table-wrapper">
          <table className="applications-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Location</th>
                <th>Type</th>
                <th>Status</th>
                <th>Posted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    <Link to={`/jobs/${job.id}`} className="auth-link">{job.title}</Link>
                  </td>
                  <td>{job.location}</td>
                  <td>{job.job_type}</td>
                  <td>
                    <span className={`status-badge ${job.status === "open" ? "status-hired" : "status-rejected"}`}>
                      {job.status}
                    </span>
                  </td>
                  <td>{new Date(job.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(job.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Jobs;

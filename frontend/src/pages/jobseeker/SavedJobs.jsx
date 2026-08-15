import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSavedJobs, unsaveJob } from "../../services/applicationService";
import { getJobById } from "../../services/jobService";
import JobCard from "../../components/jobs/JobCard";
import { useToast } from "../../components/common/Toast";
import Loader from "../../components/common/Loader";
import "./SavedJobs.css";

function SavedJobs() {
  const { showToast } = useToast();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSavedJobs = async () => {
    setLoading(true);
    try {
      const saved = await getSavedJobs();

      const enriched = await Promise.all(
        saved.map(async (item) => {
          try {
            const job = await getJobById(item.job_id);
            return { ...item, job };
          } catch {
            return { ...item, job: null };
          }
        })
      );

      setSavedJobs(enriched.filter((item) => item.job !== null));
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to load saved jobs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUnsave = async (jobId) => {
    try {
      await unsaveJob(jobId);
      setSavedJobs((prev) => prev.filter((item) => item.job_id !== jobId));
      showToast("Removed from saved jobs", "success");
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to remove job", "error");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="saved-jobs-page container">
      <h1 className="page-title">Saved Jobs</h1>

      {savedJobs.length === 0 ? (
        <div className="empty-state">
          <p>
            You haven't saved any jobs yet.{" "}
            <Link to="/jobs" className="auth-link">Browse jobs</Link>
          </p>
        </div>
      ) : (
        <div className="job-list">
          {savedJobs.map((item) => (
            <JobCard
              key={item.id}
              job={item.job}
              actions={
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleUnsave(item.job_id)}
                >
                  Remove
                </button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedJobs;

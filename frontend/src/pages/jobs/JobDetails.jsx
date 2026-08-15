import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { getJobById } from "../../services/jobService";
import { applyJob, saveJob } from "../../services/applicationService";
import { AuthContext } from "../../context/AuthContext";
import { useToast } from "../../components/common/Toast";
import Loader from "../../components/common/Loader";
import "./JobDetails.css";

const JOB_TYPE_LABELS = {
  full_time: "Full-Time",
  part_time: "Part-Time",
  contract: "Contract",
  internship: "Internship",
  remote: "Remote",
};

function JobDetails() {
  const { id } = useParams();
  const { user, isAuthenticated } = useContext(AuthContext);
  const { showToast } = useToast();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getJobById(id);
        setJob(data);
      } catch (err) {
        setError(err.response?.data?.detail || "Job not found");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await applyJob(job.id);
      setApplied(true);
      showToast("Application submitted successfully!", "success");
    } catch (err) {
      const message = err.response?.data?.detail || "Failed to apply. Please try again.";
      showToast(message, "error");
    } finally {
      setApplying(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveJob(job.id);
      setSaved(true);
      showToast("Job saved", "success");
    } catch (err) {
      const message = err.response?.data?.detail || "Failed to save job.";
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="job-details-page container">
        <div className="listing-error">{error}</div>
        <Link to="/jobs" className="btn btn-outline">Back to Jobs</Link>
      </div>
    );
  }

  return (
    <div className="job-details-page container">
      <div className="job-details-card">
        <div className="job-details-header">
          <div>
            <h1 className="job-details-title">{job.title}</h1>
            {job.location && <p className="job-details-location">📍 {job.location}</p>}
          </div>
          <span className={`job-tag job-status-${job.status}`}>
            {job.status === "open" ? "Open" : "Closed"}
          </span>
        </div>

        <div className="job-details-meta">
          {job.job_type && (
            <span className="job-tag">{JOB_TYPE_LABELS[job.job_type] || job.job_type}</span>
          )}
          {job.salary && <span className="job-tag">💰 {job.salary}</span>}
        </div>

        <section className="job-details-section">
          <h2>Description</h2>
          <p>{job.description}</p>
        </section>

        {job.required_skills && (
          <section className="job-details-section">
            <h2>Required Skills</h2>
            <div className="job-card-skills">
              {job.required_skills.split(",").map((skill) => (
                <span key={skill.trim()} className="skill-pill">{skill.trim()}</span>
              ))}
            </div>
          </section>
        )}

        <div className="job-details-actions">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="btn btn-primary">Log in to Apply</Link>
              <Link to="/register" className="btn btn-outline">Create Account</Link>
            </>
          ) : user?.role === "job_seeker" ? (
            <>
              <button
                className="btn btn-primary"
                onClick={handleApply}
                disabled={applying || applied || job.status !== "open"}
              >
                {applied ? "Applied ✓" : applying ? "Applying..." : "Apply Now"}
              </button>
              <button
                className="btn btn-outline"
                onClick={handleSave}
                disabled={saving || saved}
              >
                {saved ? "Saved ✓" : saving ? "Saving..." : "Save Job"}
              </button>
            </>
          ) : (
            <p className="text-muted">
              Only job seekers can apply to this position.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobDetails;

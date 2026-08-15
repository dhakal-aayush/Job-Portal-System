import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getEmployerJobs } from "../../services/employerService";
import { updateJob, deleteJob } from "../../services/jobService";
import { useToast } from "../../components/common/Toast";
import Loader from "../../components/common/Loader";
import "./ManageJobs.css";

const JOB_TYPE_LABELS = {
  full_time: "Full-Time",
  part_time: "Part-Time",
  contract: "Contract",
  internship: "Internship",
  remote: "Remote",
};

function ManageJobs() {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await getEmployerJobs();
      setJobs(data);
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

  const openEdit = (job) => {
    setEditingJob(job);
    setEditForm({
      title: job.title,
      description: job.description,
      required_skills: job.required_skills || "",
      location: job.location || "",
      salary: job.salary || "",
      job_type: job.job_type || "full_time",
      status: job.status,
    });
  };

  const closeEdit = () => {
    setEditingJob(null);
    setEditForm({});
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateJob(editingJob.id, editForm);
      setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
      showToast("Job updated successfully", "success");
      closeEdit();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to update job", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (job) => {
    const newStatus = job.status === "open" ? "closed" : "open";
    try {
      const updated = await updateJob(job.id, { status: newStatus });
      setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
      showToast(`Job marked as ${newStatus}`, "success");
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to update status", "error");
    }
  };

  const handleDelete = async (jobId) => {
    try {
      await deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      showToast("Job deleted", "success");
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to delete job", "error");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="manage-jobs-page container">
      <div className="section-header">
        <h1 className="page-title">Manage Jobs</h1>
        <Link to="/post-job" className="btn btn-primary">Post New Job</Link>
      </div>

      {jobs.length === 0 ? (
        <div className="empty-state">
          <p>
            You haven't posted any jobs yet.{" "}
            <Link to="/post-job" className="auth-link">Post your first job</Link>
          </p>
        </div>
      ) : (
        <div className="manage-jobs-list">
          {jobs.map((job) => (
            <div key={job.id} className="manage-job-row">
              <div className="manage-job-info">
                <Link to={`/jobs/${job.id}`} className="manage-job-title">{job.title}</Link>
                <div className="job-card-meta">
                  <span className="job-tag">📍 {job.location}</span>
                  <span className="job-tag">{JOB_TYPE_LABELS[job.job_type] || job.job_type}</span>
                  <span className={`job-tag job-status-${job.status}`}>
                    {job.status === "open" ? "Open" : "Closed"}
                  </span>
                </div>
              </div>

              <div className="manage-job-actions">
                <Link to={`/applicants/${job.id}`} className="btn btn-outline btn-sm">
                  Applicants
                </Link>
                <button className="btn btn-outline btn-sm" onClick={() => openEdit(job)}>
                  Edit
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => handleToggleStatus(job)}>
                  {job.status === "open" ? "Close" : "Reopen"}
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(job.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingJob && (
        <div className="modal-overlay" onClick={closeEdit}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Job</h2>
            <form onSubmit={handleSaveEdit} className="job-form">
              <div className="form-group">
                <label htmlFor="edit-title">Title</label>
                <input id="edit-title" name="title" type="text" value={editForm.title} onChange={handleEditChange} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-location">Location</label>
                  <input id="edit-location" name="location" type="text" value={editForm.location} onChange={handleEditChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-job_type">Job Type</label>
                  <select id="edit-job_type" name="job_type" value={editForm.job_type} onChange={handleEditChange}>
                    {Object.entries(JOB_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit-salary">Salary</label>
                <input id="edit-salary" name="salary" type="text" value={editForm.salary} onChange={handleEditChange} />
              </div>

              <div className="form-group">
                <label htmlFor="edit-description">Description</label>
                <textarea id="edit-description" name="description" rows="5" value={editForm.description} onChange={handleEditChange} />
              </div>

              <div className="form-group">
                <label htmlFor="edit-required_skills">Required Skills</label>
                <input id="edit-required_skills" name="required_skills" type="text" value={editForm.required_skills} onChange={handleEditChange} />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={closeEdit}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageJobs;

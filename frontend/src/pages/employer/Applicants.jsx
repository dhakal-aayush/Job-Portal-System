import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getApplicantsByJob, updateApplicationStatus } from "../../services/applicationService";
import { getRankedCandidates } from "../../services/recommendationService";
import { getJobById } from "../../services/jobService";
import { useToast } from "../../components/common/Toast";
import Loader from "../../components/common/Loader";
import "../jobseeker/Applications.css";
import "./Applicants.css";

const STATUS_OPTIONS = ["pending", "reviewed", "shortlisted", "rejected", "hired"];

function Applicants() {
  const { jobId } = useParams();
  const { showToast } = useToast();

  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [jobData, appsData] = await Promise.all([
        getJobById(jobId),
        getApplicantsByJob(jobId),
      ]);
      setJob(jobData);

      // Get AI-ranked scores and merge into applicant rows by user_id
      let scoreMap = {};
      try {
        const ranked = await getRankedCandidates(jobId, 50);
        scoreMap = Object.fromEntries(
          (ranked.candidates || []).map((c) => [c.user_id, c.score])
        );
      } catch {
        // candidate ranking is best-effort; fall back to stored match_score
      }

      setApplicants(
        appsData.map((app) => ({
          ...app,
          ai_score: scoreMap[app.user_id] ?? app.match_score,
        }))
      );
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to load applicants", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    try {
      await updateApplicationStatus(applicationId, newStatus);
      setApplicants((prev) =>
        prev.map((a) => (a.id === applicationId ? { ...a, status: newStatus } : a))
      );
      showToast("Status updated", "success");
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to update status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="applicants-page container">
      <div className="section-header">
        <h1 className="page-title">
          Applicants {job ? `for ${job.title}` : ""}
        </h1>
        <Link to="/manage-jobs" className="btn btn-outline">Back to Jobs</Link>
      </div>

      {applicants.length === 0 ? (
        <div className="empty-state">
          <p>No applications received yet for this job.</p>
        </div>
      ) : (
        <div className="applications-table-wrapper">
          <table className="applications-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>AI Match Score</th>
                <th>Applied On</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applicants
                .slice()
                .sort((a, b) => (b.ai_score ?? -1) - (a.ai_score ?? -1))
                .map((app) => (
                  <tr key={app.id}>
                    <td>{app.applicant_name}</td>
                    <td>
                      {app.ai_score != null ? (
                        <span className="job-card-score">{app.ai_score}% match</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{new Date(app.applied_at).toLocaleDateString()}</td>
                    <td>
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        disabled={updatingId === app.id}
                        className="status-select"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
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

export default Applicants;

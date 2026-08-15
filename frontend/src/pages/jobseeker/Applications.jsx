import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyApplications } from "../../services/applicationService";
import Loader from "../../components/common/Loader";
import "./Applications.css";

function ScoreBadge({ score }) {
  if (score === null || score === undefined) {
    return <span className="score-empty">No Score</span>;
  }

  let className = "score-low";

  if (score >= 70) {
    className = "score-high";
  } else if (score >= 40) {
    className = "score-medium";
  }

  return (
    <span className={`score-badge ${className}`}>
      {score}%
    </span>
  );
}

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyApplications()
      .then((data) => {
        setApplications(data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="applications-page">
        <Loader />
      </div>
    );
  }

  return (
    <div className="applications-page">

      <div className="page-header">

        <div>

          <h1 className="page-title">
            My Applications
          </h1>

          <p className="page-subtitle">
            Track all jobs you have applied for and monitor your application status.
          </p>

        </div>

        <Link
          to="/jobs"
          className="browse-btn"
        >
          Browse Jobs
        </Link>

      </div>

      {applications.length === 0 ? (

        <div className="empty-state">

          <div className="empty-icon">
            📄
          </div>

          <h3>No Applications Yet</h3>

          <p>
            You haven't applied for any jobs.
          </p>

          <Link
            to="/jobs"
            className="browse-btn"
          >
            Find Jobs
          </Link>

        </div>

      ) : (

        <>

          <div className="application-note">

            <strong>AI Match Score</strong> compares your resume and skills
            against the job description.

            <Link
              to="/resume"
              className="inline-link"
            >
              Upload Resume
            </Link>

            <Link
              to="/profile"
              className="inline-link"
            >
              Update Skills
            </Link>

          </div>

          <div className="table-wrap">

            <table className="data-table">

              <thead>

                <tr>

                  <th>Job</th>

                  <th>Status</th>

                  <th>AI Match</th>

                  <th>Applied Date</th>

                  <th>Action</th>

                </tr>

              </thead>

              <tbody>

                {applications.map((app) => (

                  <tr key={app.id}>

                    <td>

                      <div className="job-cell">

                        <div className="job-icon">
                          💼
                        </div>

                        <div>

                          <Link
                            to={`/jobs/${app.job_id}`}
                            className="job-link"
                          >
                            Job #{app.job_id}
                          </Link>

                          <div className="job-id">
                            Application ID #{app.id}
                          </div>

                        </div>

                      </div>

                    </td>

                    <td>

                      <span
                        className={`status-badge status-${app.status}`}
                      >
                        {app.status}
                      </span>

                    </td>

                    <td>

                      <ScoreBadge
                        score={app.match_score}
                      />

                    </td>

                    <td>

                      {new Date(
                        app.applied_at
                      ).toLocaleDateString()}

                    </td>

                    <td>

                      <Link
                        to={`/jobs/${app.job_id}`}
                        className="view-btn"
                      >
                        View Job
                      </Link>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </>

      )}

    </div>
  );
}
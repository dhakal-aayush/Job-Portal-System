import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { getRecommendations } from "../../services/recommendationService";
import { getMyResumes } from "../../services/resumeService";
import { AuthContext } from "../../context/AuthContext";
import JobCard from "../../components/jobs/JobCard";
import Loader from "../../components/common/Loader";
import "./Recommendations.css";

export default function Recommendations() {
  const { user } = useContext(AuthContext);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasResume, setHasResume] = useState(false);
  const [hasSkills, setHasSkills] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // Check profile completeness in parallel with recommendations
        const [recData, resumes] = await Promise.allSettled([
          getRecommendations(10),
          getMyResumes(),
        ]);

        if (recData.status === "fulfilled") {
          // Filter out 0% matches — they mean no profile data, not a real match
          const meaningful = (recData.value.recommendations || []).filter(r => r.score > 0);
          setRecs(meaningful);
        }

        if (resumes.status === "fulfilled") {
          setHasResume(resumes.value.length > 0);
        }

        setHasSkills(!!(user?.skills && user.skills.trim()));
      } catch {
        setError("Failed to load recommendations.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const profileComplete = hasResume || hasSkills;

  return (
    <div className="seeker-page container">
      <h1 className="page-title">AI Job Recommendations</h1>
      <p className="text-muted" style={{marginBottom:"1.5rem"}}>
        Personalized matches based on your resume and skills using TF-IDF + KNN.
      </p>

      {/* Profile completeness banner */}
      {!loading && !profileComplete && (
        <div className="profile-banner">
          <span>⚠️ Your profile is incomplete — recommendations need your skills or resume to generate accurate matches.</span>
          <div style={{display:"flex", gap:"0.75rem", marginTop:"0.75rem", flexWrap:"wrap"}}>
            <Link to="/resume" className="btn btn-primary btn-sm">Upload Resume</Link>
            <Link to="/profile" className="btn btn-outline btn-sm">Add Skills</Link>
          </div>
        </div>
      )}

      {!loading && profileComplete && !hasResume && (
        <div className="profile-tip">
          💡 <strong>Tip:</strong> Upload a PDF resume for better AI matching — extracted text gives more accurate results than skills alone.
          <Link to="/resume" style={{color:"var(--primary)", marginLeft:"0.5rem"}}>Upload now →</Link>
        </div>
      )}

      {loading ? <Loader /> : error ? (
        <div className="list-error">{error}</div>
      ) : recs.length === 0 ? (
        <div className="empty-state">
          {profileComplete
            ? <p>No matching jobs found right now. Check back as new jobs are posted.</p>
            : <p>Add your skills or upload a resume to receive AI-powered job recommendations.</p>
          }
        </div>
      ) : (
        <div className="job-list">
          {recs.map(r => <JobCard key={r.job_id} job={r} score={r.score} />)}
        </div>
      )}
    </div>
  );
}
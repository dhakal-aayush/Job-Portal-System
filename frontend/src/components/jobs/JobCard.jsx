import { Link } from "react-router-dom";
import "./JobCard.css";

const TYPE_LABELS = { full_time:"Full-Time", part_time:"Part-Time", contract:"Contract", internship:"Internship", remote:"Remote" };

function JobCard({ job, score, actions }) {
  const id = job.id ?? job.job_id;
  return (
    <div className="job-card">
      <div className="job-card-top">
        <div>
          <h3 className="job-card-title"><Link to={`/jobs/${id}`}>{job.title}</Link></h3>
          {job.company_name && <p className="job-card-company">{job.company_name}</p>}
        </div>
        {score !== undefined && score > 0 && <span className="match-score">{score}% match</span>}
      </div>
      <div className="job-card-meta">
        {job.location && <span className="job-tag">📍 {job.location}</span>}
        {job.job_type && <span className="job-tag">{TYPE_LABELS[job.job_type] || job.job_type}</span>}
        {job.salary && <span className="job-tag">💰 {job.salary}</span>}
        {job.status && <span className={`job-tag status-${job.status}`}>{job.status}</span>}
      </div>
      {job.description && (
        <p className="job-card-desc">{job.description.length > 150 ? job.description.slice(0,150)+"…" : job.description}</p>
      )}
      {job.required_skills && (
        <div className="job-skills">
          {job.required_skills.split(",").slice(0,5).map(s => <span key={s.trim()} className="skill-pill">{s.trim()}</span>)}
        </div>
      )}
      <div className="job-card-footer">
        <Link to={`/jobs/${id}`} className="btn btn-outline btn-sm">View Details</Link>
        {actions}
      </div>
    </div>
  );
}
export default JobCard;
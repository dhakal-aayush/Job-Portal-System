import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postJob } from "../../services/employerService";
import { useToast } from "../../components/common/Toast";
import "./JobForm.css";

const JOB_TYPES = [
  { value: "full_time", label: "Full-Time" },
  { value: "part_time", label: "Part-Time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "remote", label: "Remote" },
];

const initialState = {
  title: "",
  description: "",
  required_skills: "",
  location: "",
  salary: "",
  job_type: "full_time",
};

function PostJob() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Job title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const job = await postJob(formData);
      showToast("Job posted successfully!", "success");
      navigate(`/jobs/${job.id}`);
    } catch (err) {
      const message = err.response?.data?.detail || "Failed to post job. Please try again.";
      setErrors({ form: message });
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="job-form-page container">
      <h1 className="page-title">Post a New Job</h1>

      <div className="job-form-card">
        {errors.form && <div className="auth-error">{errors.form}</div>}

        <form onSubmit={handleSubmit} className="job-form">
          <div className="form-group">
            <label htmlFor="title">Job Title</label>
            <input id="title" name="title" type="text" placeholder="e.g. Senior Backend Engineer" value={formData.title} onChange={handleChange} />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input id="location" name="location" type="text" placeholder="e.g. Kathmandu, Nepal / Remote" value={formData.location} onChange={handleChange} />
              {errors.location && <span className="field-error">{errors.location}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="job_type">Job Type</label>
              <select id="job_type" name="job_type" value={formData.job_type} onChange={handleChange}>
                {JOB_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="salary">Salary (optional)</label>
            <input id="salary" name="salary" type="text" placeholder="e.g. $80,000 - $100,000" value={formData.salary} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="description">Job Description</label>
            <textarea id="description" name="description" rows="6" placeholder="Describe the role, responsibilities, and requirements..." value={formData.description} onChange={handleChange} />
            {errors.description && <span className="field-error">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="required_skills">Required Skills</label>
            <input id="required_skills" name="required_skills" type="text" placeholder="comma-separated, e.g. python, fastapi, postgresql" value={formData.required_skills} onChange={handleChange} />
            <span className="field-hint">
              Used by the AI engine to match this job with candidates.
            </span>
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Posting..." : "Post Job"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PostJob;

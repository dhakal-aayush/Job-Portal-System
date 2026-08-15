import { useState, useEffect, useRef } from "react";
import { uploadResume, getMyResumes, deleteResume } from "../../services/resumeService";
import { useToast } from "../../components/common/Toast";
import Loader from "../../components/common/Loader";
import "./ResumeUpload.css";

function ResumeUpload() {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const loadResumes = async () => {
    setLoading(true);
    try {
      const data = await getMyResumes();
      setResumes(data);
    } catch {
      showToast("Failed to load resumes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0] || null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast("Please select a file to upload", "error");
      return;
    }

    setUploading(true);
    try {
      await uploadResume(selectedFile);
      showToast("Resume uploaded successfully", "success");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadResumes();
    } catch (err) {
      showToast(err.response?.data?.detail || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (resumeId) => {
    try {
      await deleteResume(resumeId);
      showToast("Resume deleted", "success");
      setResumes((prev) => prev.filter((r) => r.id !== resumeId));
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to delete resume", "error");
    }
  };

  return (
    <div className="resume-page container">
      <h1 className="page-title">Resume Manager</h1>

      <div className="resume-upload-card">
        <h2>Upload a New Resume</h2>
        <p className="text-muted">
          Accepted formats: PDF, DOC, DOCX (max 5MB). Uploading a new resume
          sets it as your primary resume used for AI job recommendations.
        </p>

        <form onSubmit={handleUpload} className="upload-form">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
          />
          <button type="submit" className="btn btn-primary" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>

      <h2 className="resume-list-title">Your Resumes</h2>

      {loading ? (
        <Loader />
      ) : resumes.length === 0 ? (
        <div className="empty-state">
          <p>You haven't uploaded a resume yet.</p>
        </div>
      ) : (
        <div className="resume-list">
          {resumes.map((resume) => (
            <div key={resume.id} className="resume-item">
              <div className="resume-item-info">
                <span className="resume-file-name">
                  📄 {resume.file_name}
                  {resume.is_primary && <span className="primary-badge">Primary</span>}
                </span>
                {resume.extracted_skills && (
                  <div className="job-card-skills">
                    {resume.extracted_skills.split(",").map((skill) => (
                      <span key={skill.trim()} className="skill-pill">{skill.trim()}</span>
                    ))}
                  </div>
                )}
                <span className="resume-date">
                  Uploaded {new Date(resume.uploaded_at).toLocaleDateString()}
                </span>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(resume.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ResumeUpload;

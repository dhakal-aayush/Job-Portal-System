import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import axiosInstance from "../../services/axiosInstance";
import { useToast } from "../../components/common/Toast";
import Loader from "../../components/common/Loader";
import "./Profile.css";

function Profile() {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({ name: "", skills: "", experience_years: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await axiosInstance.get("/users/me");
        setFormData({
          name: data.name || "",
          skills: data.skills || "",
          experience_years: data.experience_years || 0,
        });
      } catch {
        showToast("Failed to load profile", "error");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === "experience_years" ? Number(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axiosInstance.put("/users/me", formData);
      showToast("Profile updated successfully", "success");
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="profile-page container">
      <h1 className="page-title">My Profile</h1>

      <div className="profile-card">
        <div className="profile-readonly">
          <div className="profile-field">
            <span className="field-label">Email</span>
            <span className="field-value">{user?.email}</span>
          </div>
          <div className="profile-field">
            <span className="field-label">Role</span>
            <span className="field-value capitalize">{user?.role?.replace("_", " ")}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="skills">Skills</label>
            <textarea
              id="skills"
              name="skills"
              rows="3"
              placeholder="e.g. python, react, sql, machine learning"
              value={formData.skills}
              onChange={handleChange}
            />
            <span className="field-hint">
              Comma-separated. Used by the AI engine to recommend matching jobs.
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="experience_years">Years of Experience</label>
            <input
              id="experience_years"
              name="experience_years"
              type="number"
              min="0"
              max="60"
              value={formData.experience_years}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;

import { useState, useEffect } from "react";
import { getMyCompany, updateCompany } from "../../services/employerService";
import { useToast } from "../../components/common/Toast";
import Loader from "../../components/common/Loader";
import "../jobseeker/Profile.css";

function CompanyProfile() {
  const { showToast } = useToast();
  const [company, setCompany] = useState(null);
  const [formData, setFormData] = useState({
    company_name: "",
    website: "",
    location: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyCompany();
        setCompany(data);
        setFormData({
          company_name: data.company_name || "",
          website: data.website || "",
          location: data.location || "",
          description: data.description || "",
        });
      } catch (err) {
        showToast(err.response?.data?.detail || "Failed to load company profile", "error");
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!company) return;

    setSaving(true);
    try {
      const updated = await updateCompany(company.id, formData);
      setCompany(updated);
      showToast("Company profile updated", "success");
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to update company profile", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="profile-page container">
      <h1 className="page-title">Company Profile</h1>

      <div className="profile-card">
        <div className="profile-readonly">
          <div className="profile-field">
            <span className="field-label">Company Email</span>
            <span className="field-value">{company?.email}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="company_name">Company Name</label>
            <input id="company_name" name="company_name" type="text" value={formData.company_name} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" type="text" placeholder="https://" value={formData.website} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input id="location" name="location" type="text" value={formData.location} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="description">About the Company</label>
            <textarea id="description" name="description" rows="4" value={formData.description} onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CompanyProfile;

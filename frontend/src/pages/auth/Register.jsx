import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useToast } from "../../components/common/Toast";
import "./Auth.css";

const initialState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "job_seeker",
  company_name: "",
  company_website: "",
  company_location: "",
};

function Register() {
  const { register } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";

    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (
      !/[A-Z]/.test(formData.password) ||
      !/[a-z]/.test(formData.password) ||
      !/[0-9]/.test(formData.password)
    ) {
      newErrors.password = "Password must include uppercase, lowercase, and a number";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.role === "employer" && !formData.company_name.trim()) {
      newErrors.company_name = "Company name is required for employer accounts";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const { confirmPassword, ...payload } = formData;
      await register(payload);
      showToast("Account created successfully. Please log in.", "success");
      navigate("/login");
    } catch (err) {
      const message = err.response?.data?.detail || "Registration failed. Please try again.";
      setErrors({ form: message });
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Join thousands of job seekers and employers</p>

        {errors.form && <div className="auth-error">{errors.form}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="role-toggle">
            <button
              type="button"
              className={`role-option ${formData.role === "job_seeker" ? "active" : ""}`}
              onClick={() => setFormData({ ...formData, role: "job_seeker" })}
            >
              Job Seeker
            </button>
            <button
              type="button"
              className={`role-option ${formData.role === "employer" ? "active" : ""}`}
              onClick={() => setFormData({ ...formData, role: "employer" })}
            >
              Employer
            </button>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} />
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>
          </div>

          {formData.role === "employer" && (
            <div className="employer-fields">
              <div className="form-group">
                <label htmlFor="company_name">Company Name</label>
                <input id="company_name" name="company_name" type="text" value={formData.company_name} onChange={handleChange} />
                {errors.company_name && <span className="field-error">{errors.company_name}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="company_website">Company Website</label>
                  <input id="company_website" name="company_website" type="text" placeholder="https://" value={formData.company_website} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label htmlFor="company_location">Location</label>
                  <input id="company_location" name="company_location" type="text" value={formData.company_location} onChange={handleChange} />
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login" className="auth-link">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;

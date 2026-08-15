import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useToast } from "../common/Toast";
import "./Navbar.css";

function Navbar() {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      showToast("Logged out successfully", "success");
      navigate("/login");
    } catch {
      showToast("Logout failed. Please try again.", "error");
    }
  };

  const renderRoleLinks = () => {
    if (!isAuthenticated) return null;

    switch (user?.role) {
      case "job_seeker":
        return (
          <>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/recommendations" className="nav-link">Recommendations</Link>
            <Link to="/applications" className="nav-link">Applications</Link>
            <Link to="/saved-jobs" className="nav-link">Saved Jobs</Link>
          </>
        );
      case "employer":
        return (
          <>
            <Link to="/employer-dashboard" className="nav-link">Dashboard</Link>
            <Link to="/post-job" className="nav-link">Post Job</Link>
            <Link to="/manage-jobs" className="nav-link">Manage Jobs</Link>
          </>
        );
      case "admin":
        return (
          <>
            <Link to="/admin" className="nav-link">Admin Panel</Link>
            <Link to="/admin/users" className="nav-link">Users</Link>
            <Link to="/admin/jobs" className="nav-link">Jobs</Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Job<span className="brand-accent">Portal</span>
        </Link>

        <nav className="navbar-links">
          <Link to="/jobs" className="nav-link">Find Jobs</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          {renderRoleLinks()}
        </nav>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <Link
                to={
                  user?.role === "employer"
                    ? "/company-profile"
                    : user?.role === "admin"
                    ? "/admin"
                    : "/profile"
                }
                className="navbar-username"
              >
                {user?.name}
              </Link>
              <button className="btn btn-outline" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;

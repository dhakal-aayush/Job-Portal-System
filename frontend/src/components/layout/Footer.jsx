import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-brand">
            Job<span className="brand-accent">Portal</span>
          </h3>
          <p className="footer-text">
            AI-powered job matching connecting talented job seekers with the
            right opportunities.
          </p>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Company</h4>
          <ul className="footer-links">
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/jobs">Browse Jobs</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">For Job Seekers</h4>
          <ul className="footer-links">
            <li><Link to="/register">Create Account</Link></li>
            <li><Link to="/recommendations">AI Recommendations</Link></li>
            <li><Link to="/resume">Upload Resume</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">For Employers</h4>
          <ul className="footer-links">
            <li><Link to="/post-job">Post a Job</Link></li>
            <li><Link to="/employer-dashboard">Employer Dashboard</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {year} JobPortal. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;

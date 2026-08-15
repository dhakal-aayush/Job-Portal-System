import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (location) params.set("location", location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container hero-content">
          <h1 className="hero-title">
            Find the job that's <span className="hero-accent">right for you</span>
          </h1>
          <p className="hero-subtitle">
            AI-powered matching connects you with opportunities tailored to your skills and experience.
          </p>

          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Job title, skills, or company"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <button type="submit" className="btn btn-primary search-btn">Search Jobs</button>
          </form>
        </div>
      </section>

      <section className="container features">
        <h2 className="section-title">Why JobPortal?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>AI-Powered Matching</h3>
            <p>
              Our recommendation engine analyzes your resume and skills using
              TF-IDF and cosine similarity to surface the most relevant roles.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>Resume Insights</h3>
            <p>
              Upload your resume and we'll automatically extract your skills
              and match you to jobs that fit.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏢</div>
            <h3>For Employers</h3>
            <p>
              Post jobs and get AI-ranked candidates so you can focus on the
              applicants most likely to succeed in the role.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Track Everything</h3>
            <p>
              Save jobs, track applications, and manage your hiring pipeline
              all from one dashboard.
            </p>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container cta-content">
          <h2>Ready to get started?</h2>
          <p>Create a free account as a job seeker or employer today.</p>
          <div className="cta-actions">
            <button className="btn btn-primary" onClick={() => navigate("/register")}>
              Sign Up Free
            </button>
            <button className="btn btn-outline" onClick={() => navigate("/jobs")}>
              Browse Jobs
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

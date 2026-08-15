import "./StaticPages.css";

function About() {
  return (
    <div className="static-page">
      <div className="container static-content">
        <h1 className="static-title">About JobPortal</h1>
        <p className="static-text">
          JobPortal is an AI-powered job marketplace that connects job
          seekers with employers using machine learning. We use TF-IDF
          vectorization, cosine similarity, and K-Nearest Neighbors to match
          resumes and skill sets with the most relevant job opportunities.
        </p>

        <div className="static-grid">
          <div className="static-block">
            <h2>Our Mission</h2>
            <p>
              We believe finding the right job (or the right candidate)
              shouldn't rely on luck. Our recommendation engine continuously
              improves to surface better matches for both job seekers and
              employers.
            </p>
          </div>

          <div className="static-block">
            <h2>How It Works</h2>
            <p>
              Job seekers upload a resume or list their skills, and our
              system extracts key skills and compares them against open job
              postings. Employers receive AI-ranked candidate lists based on
              how closely an applicant's profile matches their job
              description.
            </p>
          </div>

          <div className="static-block">
            <h2>For Everyone</h2>
            <p>
              Whether you're searching for your next role, hiring for your
              team, or managing the platform as an administrator, JobPortal
              gives you the tools and insights to move faster.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;

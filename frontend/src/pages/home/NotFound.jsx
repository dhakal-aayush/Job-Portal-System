import { Link } from "react-router-dom";
import "./StaticPages.css";

function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Page not found</h2>
        <p className="not-found-text">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    </div>
  );
}

export default NotFound;

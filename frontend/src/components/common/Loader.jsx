import "./Loader.css";

function Loader({ fullScreen = true }) {
  return (
    <div className={fullScreen ? "loader-overlay" : "loader-inline"}>
      <div className="spinner" />
    </div>
  );
}

export default Loader;

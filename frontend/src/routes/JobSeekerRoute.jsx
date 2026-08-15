import ProtectedRoute from "./ProtectedRoute";

function JobSeekerRoute({ children }) {
  return <ProtectedRoute allowedRoles={["job_seeker"]}>{children}</ProtectedRoute>;
}

export default JobSeekerRoute;

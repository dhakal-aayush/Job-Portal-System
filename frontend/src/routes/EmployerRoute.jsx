import ProtectedRoute from "./ProtectedRoute";

function EmployerRoute({ children }) {
  return <ProtectedRoute allowedRoles={["employer"]}>{children}</ProtectedRoute>;
}

export default EmployerRoute;

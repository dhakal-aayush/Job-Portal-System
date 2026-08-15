import ProtectedRoute from "./ProtectedRoute";

function AdminRoute({ children }) {
  return <ProtectedRoute allowedRoles={["admin"]}>{children}</ProtectedRoute>;
}

export default AdminRoute;

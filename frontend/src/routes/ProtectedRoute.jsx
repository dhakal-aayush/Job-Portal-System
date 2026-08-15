import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/common/Loader";

/**
 * Wraps a route so it requires authentication, and optionally a specific role.
 *
 * Usage:
 *   <ProtectedRoute><Dashboard /></ProtectedRoute>
 *   <ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>
 */
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, isAuthenticated } = useContext(AuthContext);

  // Wait for the initial auth check (token verification) before deciding,
  // otherwise a page refresh would briefly redirect to /login.
  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;

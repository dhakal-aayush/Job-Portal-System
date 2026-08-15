import { useState, useEffect } from "react";
import { getUsers, updateUser, deleteUser } from "../../services/adminService";
import { useToast } from "../../components/common/Toast";
import Loader from "../../components/common/Loader";
import "../jobseeker/Applications.css";
import "./Admin.css";

const ROLES = ["job_seeker", "employer", "admin"];

function Users() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      const updated = await updateUser(userId, { role: newRole });
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      showToast("Role updated", "success");
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to update role", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleActive = async (user) => {
    setUpdatingId(user.id);
    try {
      const updated = await updateUser(user.id, { is_active: !user.is_active });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      showToast(`User ${updated.is_active ? "activated" : "deactivated"}`, "success");
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to update user", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      showToast("User deleted", "success");
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to delete user", "error");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="applicants-page container">
      <h1 className="page-title">Manage Users</h1>

      <div className="applications-table-wrapper">
        <table className="applications-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={updatingId === user.id}
                    className="status-select"
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>{role.replace("_", " ")}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <span className={`status-badge ${user.is_active ? "status-hired" : "status-rejected"}`}>
                    {user.is_active ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="admin-actions">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => handleToggleActive(user)}
                    disabled={updatingId === user.id}
                  >
                    {user.is_active ? "Disable" : "Enable"}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;

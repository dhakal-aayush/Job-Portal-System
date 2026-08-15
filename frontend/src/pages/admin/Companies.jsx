import { useState, useEffect } from "react";
import { getCompanies, deleteCompany } from "../../services/adminService";
import { useToast } from "../../components/common/Toast";
import Loader from "../../components/common/Loader";
import "../jobseeker/Applications.css";
import "./Admin.css";

function Companies() {
  const { showToast } = useToast();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to load companies", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (companyId) => {
    try {
      await deleteCompany(companyId);
      setCompanies((prev) => prev.filter((c) => c.id !== companyId));
      showToast("Company deleted", "success");
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to delete company", "error");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="applicants-page container">
      <h1 className="page-title">All Companies</h1>

      {companies.length === 0 ? (
        <div className="empty-state"><p>No companies found.</p></div>
      ) : (
        <div className="applications-table-wrapper">
          <table className="applications-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Email</th>
                <th>Location</th>
                <th>Website</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id}>
                  <td>{company.company_name}</td>
                  <td>{company.email}</td>
                  <td>{company.location || "—"}</td>
                  <td>
                    {company.website ? (
                      <a href={company.website} target="_blank" rel="noreferrer" className="auth-link">
                        {company.website}
                      </a>
                    ) : "—"}
                  </td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(company.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Companies;

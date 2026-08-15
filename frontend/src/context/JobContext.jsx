import { createContext, useState, useCallback } from "react";
import { getJobs } from "../services/jobService";

export const JobContext = createContext();

function JobProvider({ children }) {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [filters, setFilters] = useState({ keyword: "", location: "", job_type: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchJobs = useCallback(async (overrides = {}) => {
    setLoading(true);
    setError(null);

    const params = {
      ...filters,
      ...overrides,
      page: overrides.page ?? page,
      page_size: pageSize,
    };

    // Strip empty filter values so they aren't sent as empty query params
    Object.keys(params).forEach((key) => {
      if (params[key] === "" || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });

    try {
      const data = await getJobs(params);
      setJobs(data.items);
      setTotal(data.total);
      if (overrides.page) setPage(overrides.page);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  return (
    <JobContext.Provider
      value={{
        jobs,
        total,
        page,
        pageSize,
        filters,
        setFilters,
        loading,
        error,
        fetchJobs,
        setPage,
      }}
    >
      {children}
    </JobContext.Provider>
  );
}

export default JobProvider;

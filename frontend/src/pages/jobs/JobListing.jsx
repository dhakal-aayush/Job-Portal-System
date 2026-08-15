import { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { JobContext } from "../../context/JobContext";
import JobCard from "../../components/jobs/JobCard";
import Loader from "../../components/common/Loader";
import "./JobListing.css";

const JOB_TYPES = [
  { value: "", label: "All Types" },
  { value: "full_time", label: "Full-Time" },
  { value: "part_time", label: "Part-Time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "remote", label: "Remote" },
];

function JobListing() {
  const { jobs, total, page, pageSize, filters, setFilters, loading, error, fetchJobs } =
    useContext(JobContext);

  const [searchParams] = useSearchParams();
  const [localFilters, setLocalFilters] = useState({
    keyword: searchParams.get("keyword") || "",
    location: searchParams.get("location") || "",
    job_type: searchParams.get("job_type") || "",
  });

  // Initial load (and load when arriving via Home's search bar)
  useEffect(() => {
    setFilters(localFilters);
    fetchJobs({ ...localFilters, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setLocalFilters({ ...localFilters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(localFilters);
    fetchJobs({ ...localFilters, page: 1 });
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const goToPage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchJobs({ ...filters, page: newPage });
  };

  return (
    <div className="job-listing-page container">
      <h1 className="page-title">Find Your Next Job</h1>

      <form className="filters-bar" onSubmit={handleSearch}>
        <input
          type="text"
          name="keyword"
          placeholder="Job title or keyword"
          value={localFilters.keyword}
          onChange={handleChange}
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={localFilters.location}
          onChange={handleChange}
        />
        <select name="job_type" value={localFilters.job_type} onChange={handleChange}>
          {JOB_TYPES.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {error && <div className="listing-error">{error}</div>}

      {loading ? (
        <Loader />
      ) : jobs.length === 0 ? (
        <div className="empty-state">
          <p>No jobs found matching your criteria.</p>
        </div>
      ) : (
        <>
          <p className="results-count">{total} job{total !== 1 ? "s" : ""} found</p>

          <div className="job-list">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default JobListing;

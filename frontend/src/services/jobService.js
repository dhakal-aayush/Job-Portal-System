import axiosInstance from "./axiosInstance";

// =========================
// LIST / SEARCH JOBS (public, paginated)
// =========================
export const getJobs = async (params = {}) => {
  const response = await axiosInstance.get("/jobs/", { params });
  return response.data; // { total, page, page_size, items }
};

// =========================
// GET JOB DETAILS
// =========================
export const getJobById = async (id) => {
  const response = await axiosInstance.get(`/jobs/${id}`);
  return response.data;
};

// =========================
// CREATE JOB (employer)
// =========================
export const createJob = async (jobData) => {
  const response = await axiosInstance.post("/jobs/", jobData);
  return response.data;
};

// =========================
// UPDATE JOB (employer, owner only)
// =========================
export const updateJob = async (jobId, jobData) => {
  const response = await axiosInstance.put(`/jobs/${jobId}`, jobData);
  return response.data;
};

// =========================
// DELETE JOB (employer, owner only)
// =========================
export const deleteJob = async (jobId) => {
  const response = await axiosInstance.delete(`/jobs/${jobId}`);
  return response.data;
};

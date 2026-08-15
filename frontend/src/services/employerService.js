import axiosInstance from "./axiosInstance";

// =========================
// POST A NEW JOB
// =========================
export const postJob = async (jobData) => {
  const response = await axiosInstance.post("/jobs/", jobData);
  return response.data;
};

// =========================
// GET JOBS POSTED BY CURRENT EMPLOYER
// =========================
export const getEmployerJobs = async () => {
  const response = await axiosInstance.get("/jobs/employer/mine");
  return response.data;
};

// =========================
// COMPANY PROFILE (employer)
// =========================
export const getMyCompany = async () => {
  const response = await axiosInstance.get("/companies/me");
  return response.data;
};

export const updateCompany = async (companyId, data) => {
  const response = await axiosInstance.put(`/companies/${companyId}`, data);
  return response.data;
};

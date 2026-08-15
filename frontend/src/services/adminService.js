import axiosInstance from "./axiosInstance";

// =========================
// USERS (admin)
// =========================
export const getUsers = async () => {
  const response = await axiosInstance.get("/users/");
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await axiosInstance.get(`/users/${userId}`);
  return response.data;
};

export const updateUser = async (userId, data) => {
  const response = await axiosInstance.put(`/users/${userId}`, data);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await axiosInstance.delete(`/users/${userId}`);
  return response.data;
};

// =========================
// COMPANIES (admin)
// =========================
export const getCompanies = async () => {
  const response = await axiosInstance.get("/companies/");
  return response.data;
};

export const deleteCompany = async (companyId) => {
  const response = await axiosInstance.delete(`/companies/${companyId}`);
  return response.data;
};

// =========================
// JOBS (admin oversight - reuses public job listing with high page size)
// =========================
export const getAllJobsForAdmin = async () => {
  const response = await axiosInstance.get("/jobs/", { params: { page_size: 100 } });
  return response.data;
};

export const deleteJobAsAdmin = async (jobId) => {
  const response = await axiosInstance.delete(`/jobs/${jobId}`);
  return response.data;
};

// =========================
// RECOMMENDATION ANALYTICS
// =========================
export const getRecommendationAnalytics = async () => {
  const response = await axiosInstance.get("/ai/analytics");
  return response.data;
};

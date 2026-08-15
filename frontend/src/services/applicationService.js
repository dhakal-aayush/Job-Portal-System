import axiosInstance from "./axiosInstance";

// =========================
// APPLY FOR A JOB
// =========================
export const applyJob = async (jobId, resumeId = null) => {
  const response = await axiosInstance.post("/applications/", {
    job_id: jobId,
    resume_id: resumeId,
  });
  return response.data;
};

// =========================
// GET LOGGED-IN USER'S APPLICATIONS
// =========================
export const getMyApplications = async () => {
  const response = await axiosInstance.get("/applications/me");
  return response.data;
};

// =========================
// EMPLOYER: VIEW APPLICANTS FOR A JOB (AI-ranked by match_score)
// =========================
export const getApplicantsByJob = async (jobId) => {
  const response = await axiosInstance.get(`/applications/job/${jobId}`);
  return response.data;
};

// =========================
// EMPLOYER: UPDATE APPLICATION STATUS
// =========================
export const updateApplicationStatus = async (applicationId, status) => {
  const response = await axiosInstance.patch(
    `/applications/${applicationId}/status`,
    { status }
  );
  return response.data;
};

// =========================
// SAVED JOBS
// =========================
export const saveJob = async (jobId) => {
  const response = await axiosInstance.post("/applications/saved", { job_id: jobId });
  return response.data;
};

export const getSavedJobs = async () => {
  const response = await axiosInstance.get("/applications/saved");
  return response.data;
};

export const unsaveJob = async (jobId) => {
  const response = await axiosInstance.delete(`/applications/saved/${jobId}`);
  return response.data;
};

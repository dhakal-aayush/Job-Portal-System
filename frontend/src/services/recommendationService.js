import axiosInstance from "./axiosInstance";

// =========================
// AI-POWERED JOB RECOMMENDATIONS (TF-IDF + Cosine + KNN)
// =========================
export const getRecommendations = async (topK = 5) => {
  const response = await axiosInstance.get("/ai/recommendations", {
    params: { top_k: topK },
  });
  return response.data; // { recommendations: [{ job_id, title, company_name, score }] }
};

// =========================
// MATCH RESUME TEXT AGAINST A SPECIFIC JOB
// =========================
export const matchResumeToJob = async (jobId, resumeText) => {
  const response = await axiosInstance.post(`/ai/${jobId}`, {
    resume_text: resumeText,
  });
  return response.data; // { match_score, skills }
};

// =========================
// EXTRACT SKILLS FROM RESUME TEXT
// =========================
export const extractSkills = async (resumeText) => {
  const response = await axiosInstance.post("/ai/skills", {
    resume_text: resumeText,
  });
  return response.data; // { skills: [...] }
};

// =========================
// EMPLOYER: AI-RANKED CANDIDATES FOR A JOB
// =========================
export const getRankedCandidates = async (jobId, topK = 10) => {
  const response = await axiosInstance.get(`/ai/jobs/${jobId}/candidates`, {
    params: { top_k: topK },
  });
  return response.data; // { candidates: [{ user_id, name, resume_id, score }] }
};

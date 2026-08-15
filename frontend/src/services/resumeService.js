import axiosInstance from "./axiosInstance";

// =========================
// UPLOAD RESUME (multipart/form-data)
// =========================
export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosInstance.post("/resumes/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// =========================
// GET MY RESUMES
// =========================
export const getMyResumes = async () => {
  const response = await axiosInstance.get("/resumes/");
  return response.data;
};

// =========================
// DELETE A RESUME
// =========================
export const deleteResume = async (resumeId) => {
  const response = await axiosInstance.delete(`/resumes/${resumeId}`);
  return response.data;
};

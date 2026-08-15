import axiosInstance from "./axiosInstance";

// =========================
// REGISTER
// =========================
export const registerUser = async (userData) => {
  const response = await axiosInstance.post("/auth/signup", userData);
  return response.data;
};

// =========================
// LOGIN (FORM DATA - FASTAPI OAuth2PasswordRequestForm)
// =========================
export const loginUser = async (credentials) => {
  const formData = new URLSearchParams();
  formData.append("username", credentials.email);
  formData.append("password", credentials.password);

  const response = await axiosInstance.post("/auth/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const { access_token, refresh_token, user } = response.data;

  localStorage.setItem("access_token", access_token);
  localStorage.setItem("refresh_token", refresh_token);
  localStorage.setItem("role", user.role);
  localStorage.setItem("user", JSON.stringify(user));

  return response.data;
};

// =========================
// LOGOUT (revokes refresh token server-side)
// =========================
export const logoutUser = async () => {
  const refreshToken = localStorage.getItem("refresh_token");

  try {
    if (refreshToken) {
      await axiosInstance.post("/auth/logout", { refresh_token: refreshToken });
    }
  } finally {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
  }
};

// =========================
// REFRESH ACCESS TOKEN (used by axios interceptor, exposed for manual use too)
// =========================
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refresh_token");

  const response = await axiosInstance.post("/auth/refresh", {
    refresh_token: refreshToken,
  });

  localStorage.setItem("access_token", response.data.access_token);
  localStorage.setItem("refresh_token", response.data.refresh_token);

  return response.data;
};

// =========================
// GET PROFILE (JWT REQUIRED - header attached by axiosInstance)
// =========================
export const getProfile = async () => {
  const response = await axiosInstance.get("/auth/profile");
  return response.data;
};

// =========================
// FORGOT PASSWORD
// =========================
export const forgotPassword = async (email) => {
  const response = await axiosInstance.post("/auth/forgot-password", { email });
  return response.data;
};

// =========================
// RESET PASSWORD
// =========================
export const resetPassword = async (token, newPassword) => {
  const response = await axiosInstance.post("/auth/reset-password", {
    token,
    new_password: newPassword,
  });
  return response.data;
};

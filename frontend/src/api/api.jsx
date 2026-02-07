import axios from "axios";

// PUBLIC API (no auth required)
export const publicApi = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  withCredentials: true,
});

// PRIVATE API (JWT attached automatically)
export const privateApi = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  withCredentials: true,
});

privateApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Public endpoints
export const checkUser = async (usernameOrEmail) => {
  const res = await publicApi.post("auth/check-user/", {
    username_or_email: usernameOrEmail,
  });
  return res.data.exists;
};

export const login = async (username, password) => {
  const res = await publicApi.post("auth/login/", { username, password });
  localStorage.setItem("accessToken", res.data.access);
  localStorage.setItem("userId", res.data.user_id);
  localStorage.setItem("username", res.data.username);
  localStorage.setItem("firstName", res.data.first_name || "");
  return res.data;
};

export const register = async (username, email, password) => {
  const res = await publicApi.post("auth/register/", { username, email, password });
  localStorage.setItem("accessToken", res.data.access);
  localStorage.setItem("userId", res.data.user_id);
  return res.data;
};

// Protected endpoints
export const completeProfile = async (userId, data) => {
  const res = await privateApi.post("auth/complete-profile/", { user_id: userId, ...data });
  localStorage.setItem("firstName", data.first_name);
  return res.data;
};

export const fetchDashboardData = async () => {
  const res = await privateApi.get("dashboard/");
  return res.data;
};

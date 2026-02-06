import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
});

export const checkUser = async (usernameOrEmail) => {
  const response = await api.post("auth/check-user/", {
    username_or_email: usernameOrEmail,
  });
  return response.data.exists;
};

export const login = async (username, password) => {
  const response = await api.post("auth/login/", { username, password });
  return response.data;
};

export const register = async (username, email, password) => {
  const response = await api.post("auth/register/", { username, email, password });
  return response.data;
};

export const fetchDashboardData = async () => {
  const token = localStorage.getItem("accessToken");

  const response = await api.get("dashboard/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};




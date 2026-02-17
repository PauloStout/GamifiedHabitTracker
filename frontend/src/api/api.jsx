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

// Habits
export const fetchHabits = async () => {
  const res = await privateApi.get("habits/");
  return res.data;
};

export const createHabit = async (habit) => {
  const res = await privateApi.post("habits/", habit);
  return res.data;
};

export const completeHabit = async (habitId) => {
  const res = await privateApi.post(`habits/${habitId}/complete/`);
  return res.data;
};

export const deleteHabit = async (habitId) => {
  const res = await privateApi.delete(`habits/${habitId}/`);
  return res.data;
};

export const createTask = async (taskData) => {
  // taskData can include subtasks like:
  // { task_title: "Example", task_difficulty: "easy", subtasks: [{ description: "sub1" }, { description: "sub2" }] }
  const res = await privateApi.post("tasks/", taskData);
  return res.data;
};

export const fetchTasks = async () => {
  const res = await privateApi.get("tasks/");
  return res.data;
};

export const deleteTask = async (taskId) => {
  await privateApi.delete(`tasks/${taskId}/`);
};

export const completeTask = async (taskId) => {
  const res = await privateApi.post(`tasks/${taskId}/complete/`);
  return res.data;
};

export const toggleSubtask = async (subtaskId) => {
  const res = await privateApi.post(`subtasks/${subtaskId}/toggle/`);
  return res.data;
};

export const createFocusSession = async (data) => {
  const res = await privateApi.post("focus-sessions/", data);
  return res.data;
};

// Fetch leaderboard based on type: "xp", "streak", "focus"
export const fetchLeaderboard = async (type = "xp") => {
  const res = await privateApi.get(`leaderboard/?type=${type}`);
  return res.data;
};

export const fetchProgressData = async () => {
  const res = await privateApi.get("progress/");
  return res.data;
};
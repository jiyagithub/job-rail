import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// This runs BEFORE every request leaves your app.
// It attaches the JWT token (if one exists) to the Authorization header.
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("jobrail_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// This runs AFTER every response comes back.
// If the backend says "401 - token invalid/expired", we log the user out automatically.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("jobrail_token");
      localStorage.removeItem("jobrail_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
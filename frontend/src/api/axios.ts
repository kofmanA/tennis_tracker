import axios from "axios";

// Shared Axios instance used by all frontend API calls.
//
// Why a shared instance?
// - Centralized timeout/baseURL settings
// - Consistent auth header injection
// - Easier future extension (global response handlers, retries, etc.)
const api = axios.create({
  // Uses same-origin in development (via Vite proxy) unless overridden.
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  // Request timeout to prevent hanging UI states.
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  // Attach JWT token (if present) to every outgoing request.
  // This keeps page-level API calls simple and auth-aware by default.
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

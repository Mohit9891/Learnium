import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('learnium_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Clear locally stored token when the API says it's invalid,
    // so a stale token doesn't trap the user in retry loops.
    // Skip /auth/me — AuthContext already handles that case.
    const status = err?.response?.status;
    const url = err?.config?.url || '';
    if (status === 401 && !url.includes('/auth/me')) {
      const hadToken = localStorage.getItem('learnium_token');
      if (hadToken && !url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('learnium_token');
      }
    }
    return Promise.reject(err);
  }
);

export default api;

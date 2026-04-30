import axios from 'axios';

// ✅ Use environment variable OR fallback to production backend
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://neural-hire-xuj9.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // important for cookies / auth if needed
});

// ✅ Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Handle responses globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Auto logout if token expired
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(err);
  }
);

export default api;

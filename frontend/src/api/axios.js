import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Before every request: attach the saved token (if any)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// After every response: if a saved token was rejected (expired or invalid), log out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Turns any API error into a readable message for the user
export const getErrorMessage = (error) =>
  error.response?.data?.message || 'Something went wrong. Please try again.';

export default api;
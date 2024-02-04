import axios from 'axios';

const baseURL = 'http://localhost:8082/api'; // Замените на свой базовый URL

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    // Другие заголовки по вашему усмотрению
  },
});

api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

export default api;
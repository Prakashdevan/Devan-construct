import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

// Add a request interceptor to include the auth token if it exists
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default API;

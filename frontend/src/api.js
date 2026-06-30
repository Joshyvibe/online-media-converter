import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // Vite
    // baseURL: process.env.REACT_APP_API_URL, // CRA
});

export default api;

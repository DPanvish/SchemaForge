import axios from "axios";

const api = axios.create({
  baseURL: "https://schemaforge.onrender.com/api",
});

api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem("userInfo");

  if (userInfo) {
    try {
      const { token } = JSON.parse(userInfo);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      localStorage.removeItem("userInfo");
    }
  }

  return config;
});

export default api;


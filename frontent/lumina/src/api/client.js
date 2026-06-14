import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const client = axios.create({ baseURL: BASE_URL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default client;

// Auth
export const login = (email, password) =>
  client.post("/auth/login", { email, password });
export const signup = (email, password) =>
  client.post("/auth/signup", { email, password });

// User
export const getMe = () => client.get("/users/me");
export const updateMe = (data) => client.patch("/users/me", data);

// Sessions
export const getSessions = () => client.get("/chat/sessions");
export const createSession = (title) =>
  client.post(`/chat/sessions?title=${encodeURIComponent(title)}`);
export const deleteSession = (id) => client.delete(`/chat/sessions/${id}`);

// Messages
export const getMessages = (sessionId) =>
  client.get(`/chat/sessions/${sessionId}/messages`);

// AI Chat
export const sendMessage = (sessionId, content) =>
  client.post(`/ai/chat/${sessionId}`, { content });

// Payment
export const createOrder = (planId) =>
  client.post(`/payment/create-order?plan_id=${planId}`);

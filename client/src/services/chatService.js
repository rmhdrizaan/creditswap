import axios from "axios";

// Use Vite environment variable or fallback
const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    
    const message = error.response?.data?.message || 
                   error.message || 
                   "Request failed";
    
    throw new Error(message);
  }
);

// Chat service functions
export const getConversations = () => api.get("/chat/conversations");
export const startConversation = (listingId, workerId) => 
  api.post("/chat/start", { listingId, workerId });
export const getMessages = (conversationId, page = 1, limit = 50) => 
  api.get(`/chat/${conversationId}/messages`, { params: { page, limit } });
export const sendMessage = (conversationId, content, intent = "casual") =>
  api.post("/chat/message", { conversationId, content, intent });
export const markAsRead = (conversationId) =>
  api.put("/chat/read", { conversationId });
export const updateConversationStatus = (conversationId, status, systemMessage, metadata) =>
  api.put(`/chat/${conversationId}/status`, { status, systemMessage, metadata });
export const getConversation = (conversationId) =>
  api.get(`/chat/${conversationId}`);

// Helper to get remaining messages
export const getRemainingMessages = async (conversationId) => {
  try {
    const conversation = await getConversation(conversationId);
    return conversation.permissions?.messagesRemaining || null;
  } catch (error) {
    console.error("Error getting remaining messages:", error);
    return null;
  }
};
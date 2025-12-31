import axios from "axios";

// Use Vite environment variable or fallback
const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";

// Register User
export const signupUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/signup`, userData);
    
    if (response.data?.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 
                   error.message || 
                   "Signup failed";
    throw new Error(message);
  }
};

// Login User
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { 
      email, 
      password 
    });
    
    if (response.data?.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 
                   error.message || 
                   "Login failed";
    throw new Error(message);
  }
};

// Logout User
export const logoutUser = () => {
  localStorage.removeItem("user");
};

// Get Current User
export const getCurrentUser = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.token) {
      throw new Error("No authentication token");
    }
    
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 
                   error.message || 
                   "Failed to get user";
    throw new Error(message);
  }
};

// Update User Profile
export const updateUserProfile = async (userData) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.token) {
      throw new Error("No authentication token");
    }
    
    const response = await axios.put(`${API_URL}/users/profile`, userData, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    
    // Update local storage if successful
    if (response.data) {
      const updatedUser = { ...user, ...response.data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
    
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 
                   error.message || 
                   "Update failed";
    throw new Error(message);
  }
};
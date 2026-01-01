import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Set auth token for axios
        if (parsedUser.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
        }
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    
    // Set auth token for axios
    if (userData.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    }
  };

  // Logout function
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    delete api.defaults.headers.common['Authorization'];
    
    // Optional: redirect to login
    window.location.href = '/login';
  }, []);

  // Update user function
  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  // Refresh user data from server
  const refreshUser = useCallback(async () => {
    if (!user?.token) {
      console.error("Cannot refresh user: No token found");
      return null;
    }
    
    try {
      // Call API to get fresh user data
      const response = await api.get('/auth/me');
      if (response.data) {
        // Merge with existing user data to preserve token
        const updatedUser = { 
          ...response.data, 
          token: user.token  // Keep the original token
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return updatedUser;
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      // If token is invalid, logout
      if (error.status === 401) {
        logout();
      }
    }
    return null;
  }, [user, logout]);

  // Update user credits locally without API call
  const updateUserCredits = useCallback((creditsChange) => {
    if (!user) return null;
    
    const newCredits = (user.credits || 0) + creditsChange;
    const updatedUser = { 
      ...user, 
      credits: newCredits 
    };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    return updatedUser;
  }, [user]);

  // Get auth token
  const getToken = () => {
    return user?.token || null;
  };

  // Check if user is authenticated
  const isAuthenticated = !!user?.token;

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    refreshUser,
    updateUserCredits,
    getToken,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
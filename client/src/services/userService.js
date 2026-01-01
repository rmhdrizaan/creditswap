import api from './api';

export const getUserProfile = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (data) => {
  try {
    const response = await api.put('/users/profile', data);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const updateUserCredits = async (userId, credits) => {
  try {
    const response = await api.patch(`/users/${userId}/credits`, { credits });
    return response.data;
  } catch (error) {
    console.error('Error updating user credits:', error);
    throw error;
  }
};

export const searchUsers = async (query, limit = 10) => {
  try {
    const response = await api.get('/users/search', {
      params: { q: query, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

export const getUserStats = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

export const uploadAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  updateUserCredits,
  searchUsers,
  getUserStats,
  uploadAvatar
};
import api from './api';

const chatService = {
  // Get all conversations
  getConversations: async (params = {}) => {
    try {
      const response = await api.get('/chat', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  // Get single conversation
  getConversation: async (conversationId) => {
    try {
      const response = await api.get(`/chat/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  },

  // Create or access conversation
  createConversation: async (data) => {
    try {
      const response = await api.post('/chat', data);
      return response.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  // Update conversation settings
  updateConversation: async (conversationId, data) => {
    try {
      const response = await api.put(`/chat/${conversationId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
  },

  // Delete conversation
  deleteConversation: async (conversationId) => {
    try {
      const response = await api.delete(`/chat/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  },

  // Get messages
  getMessages: async (conversationId, params = {}) => {
    try {
      const response = await api.get(`/chat/${conversationId}/messages`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Send message
  sendMessage: async (data) => {
    try {
      const response = await api.post('/chat/message', data);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Delete message
  deleteMessage: async (messageId) => {
    try {
      const response = await api.delete(`/chat/message/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  // Edit message
  editMessage: async (messageId, content) => {
    try {
      const response = await api.put(`/chat/message/${messageId}`, { content });
      return response.data;
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  },

  // Mark messages as read
  markAsRead: async (conversationId) => {
    try {
      const response = await api.put(`/chat/${conversationId}/messages`);
      return response.data;
    } catch (error) {
      console.error('Error marking as read:', error);
      throw error;
    }
  },

  // Add reaction
  addReaction: async (messageId, emoji) => {
    try {
      const response = await api.post(`/chat/message/${messageId}/reaction`, { emoji });
      return response.data;
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  },

  // Get chat statistics
  getStats: async () => {
    try {
      const response = await api.get('/chat/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching chat stats:', error);
      throw error;
    }
  },

  // Helper to create chat from offer
  createFromOffer: async (offerId, initiatorId) => {
    try {
      // Get offer details first
      const offerResponse = await api.get(`/offers/${offerId}`);
      const offer = offerResponse.data.offer || offerResponse.data;
      
      const data = {
        userId: offer.worker._id === initiatorId ? offer.listingOwner : offer.worker._id,
        relatedOffer: offerId,
        relatedListing: offer.listing,
        title: `Job: ${offer.listing?.title || 'Offer Discussion'}`
      };
      
      return await chatService.createConversation(data);
    } catch (error) {
      console.error('Error creating chat from offer:', error);
      throw error;
    }
  },

  // Helper to create chat from listing
  createFromListing: async (listingId, otherUserId) => {
    try {
      // Get listing details
      const listingResponse = await api.get(`/listings/${listingId}`);
      const listing = listingResponse.data.listing || listingResponse.data;
      
      const data = {
        userId: otherUserId,
        relatedListing: listingId,
        title: `Job: ${listing.title}`
      };
      
      return await chatService.createConversation(data);
    } catch (error) {
      console.error('Error creating chat from listing:', error);
      throw error;
    }
  },

  // Upload file
  uploadFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/chat/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  // Search messages
  searchMessages: async (query, conversationId = null) => {
    try {
      const params = { q: query };
      if (conversationId) params.conversationId = conversationId;
      
      const response = await api.get('/chat/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching messages:', error);
      throw error;
    }
  }
};

export default chatService;
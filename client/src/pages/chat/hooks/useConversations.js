import { useState, useCallback } from 'react';
import api from '../../../services/api';

const useConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConversations = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/chat', { params });
      setConversations(response.data.conversations || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch conversations');
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const markConversationAsRead = useCallback(async (conversationId) => {
    try {
      await api.put(`/chat/${conversationId}/messages`);
      
      setConversations(prev => prev.map(conv => 
        conv._id === conversationId
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
    } catch (err) {
      console.error('Error marking conversation as read:', err);
    }
  }, []);

  const updateConversationInList = useCallback((message) => {
    setConversations(prev => {
      const updated = [...prev];
      const index = updated.findIndex(c => c._id === message.conversation);
      
      if (index !== -1) {
        const conv = updated[index];
        updated[index] = {
          ...conv,
          latestMessage: message,
          lastActivity: new Date(),
          unreadCount: conv._id === message.conversation ? 0 : (conv.unreadCount || 0) + 1
        };
        
        // Sort by last activity (most recent first)
        updated.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
      }
      
      return updated;
    });
  }, []);

  const pinConversation = useCallback(async (conversationId, pin = true) => {
    try {
      await api.put(`/chat/${conversationId}`, { isPinned: pin });
      
      setConversations(prev => prev.map(conv => 
        conv._id === conversationId
          ? { ...conv, isPinned: pin }
          : conv
      ));
    } catch (err) {
      console.error('Error pinning conversation:', err);
    }
  }, []);

  const muteConversation = useCallback(async (conversationId, mute = true) => {
    try {
      await api.put(`/chat/${conversationId}`, { isMuted: mute });
      
      setConversations(prev => prev.map(conv => 
        conv._id === conversationId
          ? { ...conv, isMuted: mute }
          : conv
      ));
    } catch (err) {
      console.error('Error muting conversation:', err);
    }
  }, []);

  const deleteConversation = useCallback(async (conversationId) => {
    try {
      await api.delete(`/chat/${conversationId}`);
      setConversations(prev => prev.filter(conv => conv._id !== conversationId));
    } catch (err) {
      console.error('Error deleting conversation:', err);
      throw err;
    }
  }, []);

  return {
    conversations,
    loading,
    error,
    fetchConversations,
    markConversationAsRead,
    updateConversationInList,
    pinConversation,
    muteConversation,
    deleteConversation
  };
};

export default useConversations;
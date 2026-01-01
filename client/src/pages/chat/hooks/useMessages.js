import { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';

const useMessages = (conversationId, userId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  const fetchMessages = useCallback(async (reset = false) => {
    if (!conversationId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const currentPage = reset ? 1 : page;
      const response = await api.get(`/chat/${conversationId}/messages`, {
        params: { page: currentPage, limit: 50 }
      });
      
      const newMessages = response.data.messages || [];
      
      if (reset) {
        setMessages(newMessages);
        setPage(2);
      } else {
        setMessages(prev => [...newMessages, ...prev]);
        setPage(prev => prev + 1);
      }
      
      setHasMore(newMessages.length === 50);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId, page]);

  const sendMessage = useCallback(async (messageData) => {
    if (!conversationId) throw new Error('No conversation selected');
    
    try {
      const response = await api.post('/chat/message', {
        ...messageData,
        conversationId
      });
      
      const newMessage = response.data.message;
      setMessages(prev => [...prev, newMessage]);
      
      return newMessage;
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  }, [conversationId]);

  const addReaction = useCallback(async (messageId, emoji) => {
    try {
      await api.post(`/chat/message/${messageId}/reaction`, { emoji });
      
      setMessages(prev => prev.map(msg => {
        if (msg._id === messageId) {
          const existingReaction = msg.reactions?.find(r => 
            r.userId === userId && r.emoji === emoji
          );
          
          return {
            ...msg,
            reactions: existingReaction
              ? msg.reactions?.filter(r => !(r.userId === userId && r.emoji === emoji))
              : [...(msg.reactions || []), { userId, emoji }]
          };
        }
        return msg;
      }));
    } catch (err) {
      console.error('Error adding reaction:', err);
      throw err;
    }
  }, [userId]);

  const deleteMessage = useCallback(async (messageId) => {
    try {
      await api.delete(`/chat/message/${messageId}`);
      
      setMessages(prev => prev.map(msg => 
        msg._id === messageId
          ? { ...msg, deleted: true, content: '[Message deleted]' }
          : msg
      ));
    } catch (err) {
      console.error('Error deleting message:', err);
      throw err;
    }
  }, []);

  const editMessage = useCallback(async (messageId, content) => {
    try {
      const response = await api.put(`/chat/message/${messageId}`, { content });
      
      setMessages(prev => prev.map(msg => 
        msg._id === messageId
          ? { ...msg, ...response.data.message }
          : msg
      ));
    } catch (err) {
      console.error('Error editing message:', err);
      throw err;
    }
  }, []);

  const markAsRead = useCallback(async (messageId) => {
    try {
      setMessages(prev => prev.map(msg => 
        msg._id === messageId && !msg.readBy?.includes(userId)
          ? { ...msg, readBy: [...(msg.readBy || []), userId] }
          : msg
      ));
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  }, [userId]);

  // Load messages when conversationId changes
  useEffect(() => {
    if (conversationId) {
      fetchMessages(true);
    }
  }, [conversationId]);

  return {
    messages,
    loading,
    hasMore,
    error,
    fetchMessages,
    sendMessage,
    addReaction,
    deleteMessage,
    editMessage,
    markAsRead
  };
};

export default useMessages;
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import * as chatService from "../services/chatService";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [permissions, setPermissions] = useState(null);

  // Load conversations (inbox)
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    
    try {
      const { conversations: data } = await chatService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  }, [user]);

  // Load specific conversation
  const openChat = useCallback(async (conversation) => {
    setActiveChat(conversation);
    setIsOpen(true);
    setLoading(true);
    
    try {
      const { messages: messagesData, conversationStatus, permissions: perms } = 
        await chatService.getMessages(conversation._id);
      
      setMessages(messagesData || []);
      setPermissions(perms);
      
      // Mark as read
      await chatService.markAsRead(conversation._id);
      
      // Refresh conversations to update unread counts
      fetchConversations();
    } catch (error) {
      console.error("Error loading chat:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchConversations]);

  // Start new conversation
  const startConversation = useCallback(async (listingId, workerId) => {
    try {
      const { conversation } = await chatService.startConversation(listingId, workerId);
      await openChat(conversation);
      return conversation;
    } catch (error) {
      console.error("Error starting conversation:", error);
      throw error;
    }
  }, [openChat]);

  // Send message
  const sendMessage = useCallback(async (content, intent = "casual") => {
    if (!activeChat || !content.trim()) return;

    // Optimistic update
    const tempId = `temp_${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      conversationId: activeChat._id,
      sender: user,
      content: content.trim(),
      intent,
      type: "text",
      createdAt: new Date().toISOString(),
      isOptimistic: true,
      readBy: [{ user: user._id, readAt: new Date() }]
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const { message: realMessage } = await chatService.sendMessage(
        activeChat._id,
        content,
        intent
      );

      // Replace optimistic message with real one
      setMessages(prev =>
        prev.map(msg =>
          msg._id === tempId ? realMessage : msg
        )
      );

      // Update conversation in list
      setConversations(prev =>
        prev.map(conv =>
          conv._id === activeChat._id
            ? {
                ...conv,
                lastMessage: {
                  content: content.length > 100 ? content.substring(0, 100) + "..." : content,
                  sender: user._id,
                  intent,
                  createdAt: new Date()
                },
                updatedAt: new Date().toISOString(),
                metadata: {
                  ...conv.metadata,
                  messagesSent: (conv.metadata?.messagesSent || 0) + 1
                }
              }
            : conv
        )
      );

      return realMessage;
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove optimistic message
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      throw error;
    }
  }, [activeChat, user]);

  // Hire worker (update conversation status)
  const hireWorker = useCallback(async (workerId, offerId) => {
    if (!activeChat) return;
    
    try {
      const systemMessage = `@${user.username} hired you for this job! Chat is now fully unlocked.`;
      
      const { conversation } = await chatService.updateConversationStatus(
        activeChat._id,
        "active",
        systemMessage,
        { hiredWorker: workerId, offerId }
      );
      
      setActiveChat(conversation);
      fetchConversations();
      
      // Refresh messages to show system message
      const { messages: newMessages } = await chatService.getMessages(activeChat._id);
      setMessages(newMessages || []);
      
      return conversation;
    } catch (error) {
      console.error("Error hiring worker:", error);
      throw error;
    }
  }, [activeChat, user, fetchConversations]);

  // Complete job
  const completeJob = useCallback(async () => {
    if (!activeChat) return;
    
    try {
      const systemMessage = "Job completed! Payment released. Chat is now archived.";
      
      const { conversation } = await chatService.updateConversationStatus(
        activeChat._id,
        "completed",
        systemMessage
      );
      
      setActiveChat(conversation);
      fetchConversations();
      
      // Refresh messages
      const { messages: newMessages } = await chatService.getMessages(activeChat._id);
      setMessages(newMessages || []);
      
      return conversation;
    } catch (error) {
      console.error("Error completing job:", error);
      throw error;
    }
  }, [activeChat, fetchConversations]);

  // Close chat
  const closeChat = useCallback(() => {
    setActiveChat(null);
    setMessages([]);
    setPermissions(null);
    setIsOpen(false);
  }, []);

  // Toggle chat drawer
  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      fetchConversations();
    }
  }, [isOpen, fetchConversations]);

  // Auto-refresh conversations every 10 seconds
  useEffect(() => {
    if (!user) return;

    fetchConversations();
    
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [user, fetchConversations]);

  // Auto-refresh active chat messages every 5 seconds
  useEffect(() => {
    if (!activeChat || !isOpen) return;

    const refreshMessages = async () => {
      try {
        const { messages: newMessages, conversationStatus } = 
          await chatService.getMessages(activeChat._id, 1, 50);
        
        // Only update if we have new messages
        if (newMessages?.length !== messages.length) {
          setMessages(newMessages || []);
        }
        
        // Update conversation status if changed
        if (conversationStatus !== activeChat.status) {
          fetchConversations();
        }
      } catch (error) {
        console.error("Error refreshing messages:", error);
      }
    };

    const interval = setInterval(refreshMessages, 5000);
    return () => clearInterval(interval);
  }, [activeChat, isOpen, messages.length]);

  const value = {
    // State
    conversations,
    activeChat,
    messages,
    loading,
    isOpen,
    permissions,
    
    // Actions
    openChat,
    closeChat,
    startConversation,
    sendMessage,
    hireWorker,
    completeJob,
    fetchConversations,
    toggleChat,
    setActiveChat,
    setIsOpen
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
};
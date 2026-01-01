import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  Send, MoreVertical, Phone, Video, Image, Paperclip, Smile,
  ChevronLeft, Search, Check, CheckCheck, Edit, Trash2,
  Reply, ThumbsUp, X, Pin, Bell, BellOff, UserPlus, Info,
  MessageSquare, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ENDPOINT = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State declarations
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);

  // Initialize Socket
  useEffect(() => {
    if (!user) return;

    const socket = io(ENDPOINT, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    
    socket.on("typing", (data) => {
      if (data.conversationId === selectedConversation?._id) {
        setTypingUsers(prev => {
          const newUsers = prev.filter(u => u !== data.userId);
          newUsers.push(data.userId);
          return newUsers;
        });
      }
    });
    
    socket.on("stop_typing", (data) => {
      if (data.conversationId === selectedConversation?._id) {
        setTypingUsers(prev => prev.filter(u => u !== data.userId));
      }
    });
    
    socket.on("message_received", (newMsg) => {
      if (selectedConversation?._id === newMsg.conversation) {
        setMessages(prev => [...prev, newMsg]);
        scrollToBottom();
        
        if (newMsg.sender._id !== user._id) {
          markMessageAsRead(newMsg._id);
        }
      }
      updateConversationList(newMsg);
    });
    
    socket.on("message_read", ({ messageId, userId }) => {
      setMessages(prev => prev.map(msg => 
        msg._id === messageId 
          ? { ...msg, readBy: [...(msg.readBy || []), userId] }
          : msg
      ));
    });
    
    socket.on("reaction_added", ({ messageId, reaction }) => {
      setMessages(prev => prev.map(msg => {
        if (msg._id !== messageId) return msg;
        
        const existingReactionIndex = msg.reactions?.findIndex(r => 
          r.userId === reaction.userId && r.emoji === reaction.emoji
        );
        
        if (existingReactionIndex >= 0) {
          const newReactions = [...(msg.reactions || [])];
          newReactions.splice(existingReactionIndex, 1);
          return { ...msg, reactions: newReactions };
        } else {
          return { 
            ...msg, 
            reactions: [...(msg.reactions || []), reaction] 
          };
        }
      }));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  // Handle typing indicator
  useEffect(() => {
    setIsTyping(typingUsers.length > 0);
  }, [typingUsers]);

  // Fetch conversations
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Handle conversation selection from URL
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c._id === conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
        fetchMessages(conversation._id);
      }
    }
  }, [conversationId, conversations]);

  // Join conversation room when selected
  useEffect(() => {
    if (selectedConversation && socketRef.current && socketConnected) {
      socketRef.current.emit("join_conversation", selectedConversation._id);
      markConversationAsRead();
    }
  }, [selectedConversation, socketConnected]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get("/chat");
      setConversations(data.conversations || []);
      
      if (conversationId && !selectedConversation) {
        const conversation = (data.conversations || []).find(c => c._id === conversationId);
        if (conversation) {
          setSelectedConversation(conversation);
          fetchMessages(conversation._id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId) => {
    try {
      const { data } = await api.get(`/chat/${convId}/messages`);
      setMessages(data.messages || []);
      
      if (socketRef.current) {
        socketRef.current.emit("join_conversation", convId);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const updateConversationList = (newMessage) => {
    setConversations(prev => {
      const updated = [...prev];
      const index = updated.findIndex(c => c._id === newMessage.conversation);
      
      if (index !== -1) {
        updated[index] = {
          ...updated[index],
          latestMessage: newMessage,
          lastActivity: new Date(),
          unreadCount: updated[index]._id === selectedConversation?._id 
            ? 0 
            : (updated[index].unreadCount || 0) + 1
        };
        
        updated.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
      }
      
      return updated;
    });
  };

  const markConversationAsRead = async () => {
    if (!selectedConversation) return;
    
    try {
      await api.put(`/chat/${selectedConversation._id}/messages`);
      
      setConversations(prev => prev.map(conv => 
        conv._id === selectedConversation._id
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markMessageAsRead = async (messageId) => {
    try {
      if (socketRef.current && selectedConversation) {
        socketRef.current.emit("message_read", { 
          messageId, 
          conversationId: selectedConversation._id 
        });
      }
    } catch (error) {
      console.error("Failed to mark message as read:", error);
    }
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const messageToSend = {
      conversationId: selectedConversation._id,
      content: newMessage.trim(),
      type: "text",
      replyTo: replyTo?._id
    };

    if (socketRef.current) {
      socketRef.current.emit("stop_typing", {
        conversationId: selectedConversation._id,
        userId: user._id
      });
    }

    try {
      const { data } = await api.post("/chat/message", messageToSend);
      
      if (socketRef.current) {
        socketRef.current.emit("send_message", data.message);
      }
      
      setMessages(prev => [...prev, data.message]);
      setNewMessage("");
      setReplyTo(null);
      scrollToBottom();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleTyping = useCallback(
    debounce(() => {
      if (selectedConversation && socketRef.current && socketConnected) {
        socketRef.current.emit("typing", {
          conversationId: selectedConversation._id,
          userId: user._id
        });
      }
    }, 300),
    [selectedConversation, socketConnected, user]
  );

  const addReaction = async (messageId, emoji) => {
    try {
      await api.post(`/chat/message/${messageId}/reaction`, { emoji });
      
      if (socketRef.current && selectedConversation) {
        socketRef.current.emit("reaction_added", {
          messageId,
          conversationId: selectedConversation._id,
          reaction: { userId: user._id, emoji }
        });
      }
    } catch (error) {
      console.error("Failed to add reaction:", error);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm("Delete this message?")) return;
    
    try {
      await api.delete(`/chat/message/${messageId}`);
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getSender = (conversation) => {
    if (!conversation?.participants || !user?._id) return null;
    return conversation.participants.find(p => p?._id !== user._id) || null;
  };

  const getMessageStatus = (message) => {
    if (!message || message.sender._id !== user._id) return null;
    
    if (message.readBy?.length > 1) {
      return <CheckCheck size={12} className="text-blue-500" />;
    } else if (message.readBy?.length === 1) {
      return <CheckCheck size={12} className="text-gray-400" />;
    } else {
      return <Check size={12} className="text-gray-400" />;
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white">
      {/* SIDEBAR - Conversation List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col ${
        selectedConversation ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <MoreVertical size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500">No conversations yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Start by placing or accepting an offer
              </p>
            </div>
          ) : (
            conversations.map((conversation) => {
              const otherUser = getSender(conversation);
              const isSelected = selectedConversation?._id === conversation._id;
              
              return (
                <div
                  key={conversation._id}
                  onClick={() => {
                    setSelectedConversation(conversation);
                    navigate(`/chat/${conversation._id}`);
                  }}
                  className={`flex items-center p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={otherUser?.avatar || `https://ui-avatars.com/api/?name=${otherUser?.username}&background=random`}
                      alt={otherUser?.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {conversation.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {otherUser?.username}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {formatTime(conversation.lastActivity)}
                      </span>
                    </div>
                    
                    {/* Job Context */}
                    {conversation.jobTitle && (
                      <p className="text-xs text-blue-600 font-medium truncate">
                        {conversation.jobTitle}
                      </p>
                    )}
                    
                    {/* Last Message */}
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.latestMessage ? (
                        <>
                          {conversation.latestMessage?.sender?._id === user?._id && "You: "}
                          {conversation.latestMessage.content || "Attachment"}
                        </>
                      ) : (
                        "Start a conversation"
                      )}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MAIN - Chat Window */}
      <div className={`flex-1 flex flex-col ${
        !selectedConversation ? 'hidden md:flex' : 'flex'
      }`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-6 border-b border-gray-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedConversation(null);
                    navigate('/chat');
                  }}
                  className="md:hidden mr-2"
                >
                  <ChevronLeft size={24} />
                </button>
                
                {/* Avatar & Info */}
                <div className="flex items-center gap-3">
                  <img
                    src={getSender(selectedConversation)?.avatar || 
                         `https://ui-avatars.com/api/?name=${getSender(selectedConversation)?.username}&background=random`}
                    alt="avatar"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {getSender(selectedConversation)?.username}
                    </h2>
                    {selectedConversation.jobTitle && (
                      <p className="text-xs text-gray-500">
                        {selectedConversation.jobTitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-4">
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Phone size={20} className="text-gray-600" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Video size={20} className="text-gray-600" />
                </button>
                <button 
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <MoreVertical size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No messages yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Start the conversation
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isMine = message?.sender?._id === user?._id;
                    const showAvatar = !isMine && (
                      index === messages.length - 1 || 
                      messages[index + 1]?.sender?._id !== message?.sender?._id
                    );
                    
                    return (
                      <div key={message._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        {/* Other User's Avatar */}
                        {showAvatar && !isMine && (
                          <img
                            src={message.sender.avatar || 
                                 `https://ui-avatars.com/api/?name=${message.sender.username}&background=random`}
                            alt={message.sender.username}
                            className="w-8 h-8 rounded-full mr-2 self-end mb-1"
                          />
                        )}
                        
                        {/* Message Container */}
                        <div className={`max-w-[70%] ${!isMine && !showAvatar ? 'ml-10' : ''}`}>
                          {/* Reply Preview */}
                          {message.replyTo && (
                            <div className={`mb-1 p-2 rounded-lg border-l-2 ${
                              isMine ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-100'
                            }`}>
                              <p className="text-xs font-medium text-gray-600">
                                {message.replyTo.sender.username}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {message.replyTo.content}
                              </p>
                            </div>
                          )}
                          
                          {/* Message Bubble */}
                          <div className={`relative group ${
                            isMine 
                              ? 'bg-blue-500 text-white rounded-2xl rounded-tr-sm' 
                              : 'bg-white text-gray-900 rounded-2xl rounded-tl-sm border border-gray-200'
                          } px-4 py-2 shadow-sm`}>
                            <p className="text-sm">{message.content}</p>
                            
                            {/* Message Footer */}
                            <div className={`flex items-center justify-end mt-1 ${
                              isMine ? 'text-blue-100' : 'text-gray-400'
                            }`}>
                              <span className="text-xs mr-2">
                                {formatTime(message.createdAt)}
                              </span>
                              {getMessageStatus(message)}
                            </div>
                            
                            {/* Message Actions */}
                            <div className={`absolute top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${
                              isMine ? '-left-12' : '-right-12'
                            } flex items-center gap-1`}>
                              <button
                                onClick={() => setReplyTo(message)}
                                className="p-1 rounded-full bg-white shadow-md hover:bg-gray-50"
                              >
                                <Reply size={14} />
                              </button>
                              <button
                                onClick={() => addReaction(message._id, '👍')}
                                className="p-1 rounded-full bg-white shadow-md hover:bg-gray-50"
                              >
                                <ThumbsUp size={14} />
                              </button>
                              {isMine && (
                                <button
                                  onClick={() => deleteMessage(message._id)}
                                  className="p-1 rounded-full bg-white shadow-md hover:bg-red-50 text-red-500"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {/* Reactions */}
                          {message.reactions?.length > 0 && (
                            <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                              {message.reactions.map((reaction, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-white border rounded-full px-2 py-1"
                                >
                                  {reaction.emoji}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Typing Indicator */}
                  {isTyping && typingUsers.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs">💬</span>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Reply Preview */}
            {replyTo && (
              <div className="px-4 pt-2 border-t border-gray-200 bg-white">
                <div className="flex items-center justify-between bg-blue-50 rounded-lg p-2">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-blue-600">
                      Replying to {replyTo.sender.username}
                    </p>
                    <p className="text-sm text-blue-800 truncate">
                      {replyTo.content}
                    </p>
                  </div>
                  <button
                    onClick={() => setReplyTo(null)}
                    className="p-1 hover:bg-blue-100 rounded-full"
                  >
                    <X size={16} className="text-blue-600" />
                  </button>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-gray-200 bg-white p-4 relative">
              <form onSubmit={sendMessage} className="flex items-end gap-2">
                {/* Attachment Buttons */}
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <Paperclip size={20} className="text-gray-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <Image size={20} className="text-gray-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <Smile size={20} className="text-gray-600" />
                  </button>
                </div>
                
                {/* Message Input */}
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(e);
                      }
                    }}
                    placeholder="Type a message..."
                    className="w-full min-h-[40px] max-h-[120px] px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="1"
                  />
                </div>
                
                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={`p-3 rounded-full transition-all ${
                    newMessage.trim()
                      ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send size={20} />
                </button>
                
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.zip"
                  multiple
                  onChange={(e) => {
                    console.log("Files selected:", e.target.files);
                    // Handle file upload here
                  }}
                />
              </form>
              
              {/* Emoji Picker */}
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-20 left-4 bg-white border border-gray-200 rounded-xl shadow-xl p-3 z-50"
                  >
                    <div className="grid grid-cols-8 gap-1">
                      {['👍', '❤️', '😂', '😮', '😢', '😡', '🙏', '👏'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setNewMessage(prev => prev + emoji);
                            setShowEmojiPicker(false);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg text-xl"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <MessageSquare size={40} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Your Messages
            </h2>
            <p className="text-gray-500 text-center max-w-md mb-8">
              Select a conversation to start messaging. 
              You can chat with users about specific jobs and offers.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-sm">
              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Briefcase size={20} className="text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Job Chats</h3>
                <p className="text-sm text-gray-600">
                  Discuss job details with interested parties
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <CheckCheck size={20} className="text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Accepted Offers</h3>
                <p className="text-sm text-gray-600">
                  Coordinate work with accepted freelancers
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-4 top-20 w-56 bg-white rounded-xl shadow-2xl border z-50 py-2"
            >
              {selectedConversation ? (
                <>
                  <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3">
                    <Pin size={16} className="text-gray-600" />
                    <span>Pin Chat</span>
                  </button>
                  <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3">
                    <Bell size={16} className="text-gray-600" />
                    <span>Mute Notifications</span>
                  </button>
                  <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3">
                    <UserPlus size={16} className="text-gray-600" />
                    <span>Add Participant</span>
                  </button>
                  <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3">
                    <Info size={16} className="text-gray-600" />
                    <span>Chat Info</span>
                  </button>
                  <div className="border-t my-2"></div>
                  <button className="w-full px-4 py-3 text-left hover:bg-red-50 text-red-500 flex items-center gap-3">
                    <Trash2 size={16} />
                    <span>Delete Chat</span>
                  </button>
                </>
              ) : (
                <>
                  <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3">
                    <Edit size={16} className="text-gray-600" />
                    <span>New Group</span>
                  </button>
                  <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3">
                    <UserPlus size={16} className="text-gray-600" />
                    <span>New Broadcast</span>
                  </button>
                  <div className="border-t my-2"></div>
                  <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3">
                    <Bell size={16} className="text-gray-600" />
                    <span>Notification Settings</span>
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default Chat;
import { useState, useEffect, useRef, useCallback } from "react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { 
  MessageCircle, X, Send, Lock, AlertTriangle, ArrowLeft, 
  MoreVertical, CheckCircle, Clock, Zap, User, Briefcase,
  ThumbsUp, Check, Star, Paperclip, Mic, Smile, HelpCircle,
  Target, Handshake, FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function ChatSystem() {
  const { 
    isOpen, 
    toggleChat, 
    activeChat, 
    setActiveChat, 
    conversations, 
    messages, 
    sendMessage, 
    fetchConversations,
    loading,
    permissions
  } = useChat();
  
  const { user } = useAuth();
  const [inputText, setInputText] = useState("");
  const [selectedIntent, setSelectedIntent] = useState("casual");
  const [suggestedReplies, setSuggestedReplies] = useState([]);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // 🆕 UNIQUE FEATURE: Smart Intent Selector
  const intents = [
    { id: "question", label: "Question", icon: <HelpCircle size={16} />, color: "bg-blue-100 text-blue-700" },
    { id: "clarification", label: "Clarify", icon: <Target size={16} />, color: "bg-purple-100 text-purple-700" },
    { id: "offer", label: "Make Offer", icon: <Handshake size={16} />, color: "bg-green-100 text-green-700" },
    { id: "agreement", label: "Agree", icon: <Check size={16} />, color: "bg-emerald-100 text-emerald-700" },
    { id: "casual", label: "Chat", icon: <Smile size={16} />, color: "bg-gray-100 text-gray-700" }
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load conversations when chat opens
  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen, fetchConversations]);

  // Typing indicator simulation
  const handleTyping = useCallback((e) => {
    setTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setTyping(false), 1000);
  }, []);

  // 🆕 UNIQUE FEATURE: Smart Reply Suggestions
  useEffect(() => {
    if (activeChat?.status === "pending" && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.sender !== user._id) {
        const suggestions = [
          "Can you tell me more about the requirements?",
          "What's the timeline for this project?",
          "I can start immediately",
          "Here's my portfolio link: ..."
        ];
        setSuggestedReplies(suggestions);
      }
    }
  }, [messages, activeChat, user._id]);

  // Handle sending message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;
    
    try {
      await sendMessage(inputText, selectedIntent);
      setInputText("");
      setSelectedIntent("casual");
      setSuggestedReplies([]);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Get other participant info
  const getOtherParticipant = (convo) => {
    if (!convo || !convo.participants) return { username: "User", avatar: "" };
    const other = convo.participants.find(p => p._id !== user._id);
    return other || convo.otherParticipant || { username: "User", avatar: "" };
  };

  // Get status color and info
  const getStatusInfo = (status) => {
    switch(status) {
      case 'pending': 
        return { 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Clock size={12} />,
          label: 'Pre-hire (3 messages max)',
          description: 'Discuss terms before hiring'
        };
      case 'active': 
        return { 
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle size={12} />,
          label: 'Active Job',
          description: 'Unlimited chat, work in progress'
        };
      case 'completed': 
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <Lock size={12} />,
          label: 'Completed',
          description: 'Read only - job finished'
        };
      case 'rejected': 
        return { 
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <X size={12} />,
          label: 'Not Selected',
          description: 'Job went to another applicant'
        };
      default: 
        return { 
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <MessageCircle size={12} />,
          label: status,
          description: ''
        };
    }
  };

  // 🆕 UNIQUE FEATURE: Message limit counter
  const getMessageCounter = () => {
    if (!activeChat || activeChat.status !== "pending") return null;
    
    const messagesSent = activeChat.metadata?.messagesSent || 0;
    const remaining = Math.max(0, 3 - messagesSent);
    
    return (
      <div className="flex items-center gap-2 text-xs">
        <div className="flex items-center gap-1">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i}
              className={`w-2 h-2 rounded-full ${i < messagesSent ? 'bg-yellow-500' : 'bg-gray-200'}`}
            />
          ))}
        </div>
        <span className="text-yellow-600 font-medium">
          {remaining} message{remaining !== 1 ? 's' : ''} remaining
        </span>
      </div>
    );
  };

  if (!user) return null;

  return (
    <>
      {/* Floating chat button with unread count */}
      <motion.button 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all z-50 flex items-center justify-center border-4 border-white"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        
        {/* Unread badge */}
        {conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0) > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-white text-xs flex items-center justify-center font-bold animate-pulse">
            {conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0)}
          </span>
        )}
      </motion.button>

      {/* Chat drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-2xl z-40 border-l border-gray-100 flex flex-col"
          >
            
            {/* INBOX VIEW */}
            {!activeChat ? (
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="font-bold text-2xl flex items-center gap-2">
                        <MessageCircle size={24} /> Messages
                      </h2>
                      <p className="text-indigo-100 text-sm mt-1">
                        {conversations.length} active conversation{conversations.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <button 
                      onClick={toggleChat}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <X size={20}/>
                    </button>
                  </div>
                </div>

                {/* Conversations list */}
                <div className="flex-1 overflow-y-auto bg-gray-50">
                  {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                        <MessageCircle size={32} className="text-indigo-400"/>
                      </div>
                      <p className="font-medium text-gray-600 text-lg">No messages yet</p>
                      <p className="text-sm mt-2 text-gray-500 max-w-xs">
                        Apply to jobs or hire workers to start conversations
                      </p>
                    </div>
                  ) : conversations.map(convo => {
                    const other = getOtherParticipant(convo);
                    const unread = convo.unreadCount || 0;
                    const statusInfo = getStatusInfo(convo.status);
                    
                    return (
                      <div 
                        key={convo._id}
                        onClick={() => setActiveChat(convo)}
                        className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-white ${
                          unread > 0 ? 'bg-indigo-50/30' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Avatar with status */}
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center font-bold text-indigo-600 text-lg border-2 border-white shadow-sm">
                              {other.username?.[0]?.toUpperCase() || "U"}
                            </div>
                            {unread > 0 && (
                              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full border-2 border-white font-bold">
                                {unread}
                              </span>
                            )}
                          </div>
                          
                          {/* Conversation info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`font-bold truncate ${unread > 0 ? 'text-gray-900' : 'text-gray-800'}`}>
                                @{other.username}
                              </h4>
                              <span className="text-xs text-gray-400 whitespace-nowrap">
                                {format(new Date(convo.updatedAt), 'HH:mm')}
                              </span>
                            </div>
                            
                            {/* Job title and status */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-semibold text-indigo-600 truncate flex-1">
                                {convo.listing?.title}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${statusInfo.color} border`}>
                                {statusInfo.icon} {convo.status}
                              </span>
                            </div>
                            
                            {/* Last message preview */}
                            <p className={`text-sm truncate ${unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                              {convo.lastMessage?.sender === user._id ? 'You: ' : ''}
                              {convo.lastMessage?.content || "No messages yet"}
                            </p>
                            
                            {/* Credits badge */}
                            {convo.listing?.credits && (
                              <div className="flex items-center gap-1 mt-1">
                                <Zap size={10} className="text-yellow-500 fill-yellow-500"/>
                                <span className="text-xs font-bold text-gray-600">
                                  {convo.listing.credits} CR
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* ACTIVE CHAT VIEW */
              <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white">
                {/* Chat header */}
                <div className="p-4 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setActiveChat(null)}
                      className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                    >
                      <ArrowLeft size={20}/>
                    </button>
                    
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center font-bold text-indigo-600 text-xl border-2 border-white">
                          {getOtherParticipant(activeChat).username?.[0]?.toUpperCase() || "U"}
                        </div>
                        {typing && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-100 rounded-full border-2 border-white flex items-center justify-center">
                            <div className="flex gap-0.5">
                              <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* User info */}
                      <div>
                        <h3 className="font-bold text-gray-800">
                          @{getOtherParticipant(activeChat).username}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 truncate max-w-[120px]">
                            {activeChat.listing?.title}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${getStatusInfo(activeChat.status).color} border`}>
                            {getStatusInfo(activeChat.status).icon}
                            {activeChat.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <MoreVertical size={20}/>
                  </button>
                </div>

                {/* Status banner */}
                {activeChat.status === "pending" && (
                  <div className="bg-yellow-50 border-b border-yellow-100 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-yellow-700">
                        <AlertTriangle size={14} />
                        <span className="font-medium">Pre-hire Mode</span>
                        <span className="text-xs">• {getStatusInfo(activeChat.status).description}</span>
                      </div>
                      {getMessageCounter()}
                    </div>
                  </div>
                )}

                {activeChat.status === "rejected" && (
                  <div className="bg-red-50 border-b border-red-100 p-3 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-red-700">
                      <X size={14} />
                      <span className="font-medium">This job was assigned to another applicant</span>
                    </div>
                  </div>
                )}

                {/* Messages area */}
                <div 
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-3"
                >
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle size={24} className="text-gray-400"/>
                      </div>
                      <p className="text-gray-500 font-medium">No messages yet</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {activeChat.status === "pending" 
                          ? "Start discussing the job details (3 messages max)" 
                          : "Start the conversation"}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Date separator */}
                      <div className="text-center my-4">
                        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                          {format(new Date(), 'MMMM d, yyyy')}
                        </span>
                      </div>

                      {messages.map((msg) => {
                        const isMe = msg.sender?._id === user._id || msg.sender === user._id;
                        const isSystem = msg.type === 'system';

                        if (isSystem) {
                          return (
                            <div key={msg._id} className="flex justify-center my-4">
                              <div className="bg-gray-100 text-gray-600 text-xs px-4 py-2 rounded-full flex items-center gap-2 shadow-sm border border-gray-200 max-w-[80%]">
                                {msg.content.includes('assigned') ? (
                                  <User size={12} className="text-red-500"/>
                                ) : (
                                  <AlertTriangle size={12} className="text-gray-500"/>
                                )}
                                <span className="text-center">{msg.content}</span>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <motion.div 
                            key={msg._id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[75%] ${isMe ? 'ml-auto' : ''}`}>
                              {/* Intent badge for received messages */}
                              {!isMe && msg.intent !== "casual" && (
                                <div className="flex items-center gap-1 mb-1 ml-1">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${intents.find(i => i.id === msg.intent)?.color || 'bg-gray-100'}`}>
                                    {intents.find(i => i.id === msg.intent)?.label || msg.intent}
                                  </span>
                                </div>
                              )}
                              
                              <div className={`rounded-2xl p-3 text-sm shadow-sm relative ${
                                isMe 
                                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-tr-none' 
                                  : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                              }`}>
                                {/* Sender name for received messages */}
                                {!isMe && (
                                  <div className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                                    <span>@{msg.sender?.username || 'User'}</span>
                                    {/* Intent badge for my messages */}
                                    {isMe && msg.intent !== "casual" && (
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${intents.find(i => i.id === msg.intent)?.color}`}>
                                        {intents.find(i => i.id === msg.intent)?.label}
                                      </span>
                                    )}
                                  </div>
                                )}
                                
                                {/* Message content */}
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                
                                {/* Message footer */}
                                <div className={`text-[10px] mt-1.5 flex justify-between items-center ${
                                  isMe ? 'text-indigo-200' : 'text-gray-400'
                                }`}>
                                  <span>
                                    {format(new Date(msg.createdAt), 'HH:mm')}
                                  </span>
                                  
                                  {isMe && (
                                    <div className="flex items-center gap-1">
                                      {msg.readBy?.length > 1 ? (
                                        <span className="text-blue-300">✓✓ Read</span>
                                      ) : (
                                        <span>✓ Sent</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Smart reply suggestions */}
                {suggestedReplies.length > 0 && (
                  <div className="px-4 pt-2 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {suggestedReplies.map((reply, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setInputText(reply);
                            handleTyping();
                          }}
                          className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input area */}
                <div className="p-4 bg-white border-t border-gray-200">
                  {activeChat.status === "completed" || activeChat.status === "blocked" || activeChat.status === "rejected" ? (
                    <div className={`p-4 rounded-xl text-center text-sm flex items-center justify-center gap-2 border ${
                      activeChat.status === "completed" 
                        ? 'bg-gray-50 text-gray-500 border-gray-200' 
                        : activeChat.status === "rejected"
                        ? 'bg-red-50 text-red-500 border-red-200'
                        : 'bg-red-50 text-red-500 border-red-200'
                    }`}>
                      {activeChat.status === "completed" ? (
                        <>
                          <Lock size={16}/>
                          This conversation is archived and read-only.
                        </>
                      ) : activeChat.status === "rejected" ? (
                        <>
                          <X size={16}/>
                          This job was assigned to another applicant.
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={16}/>
                          This conversation has been blocked.
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Intent selector */}
                      {permissions?.allowedIntents?.length > 1 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {intents
                            .filter(intent => permissions.allowedIntents.includes(intent.id))
                            .map(intent => (
                              <button
                                key={intent.id}
                                type="button"
                                onClick={() => setSelectedIntent(intent.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                  selectedIntent === intent.id
                                    ? `${intent.color} border`
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {intent.icon}
                                {intent.label}
                              </button>
                            ))}
                        </div>
                      )}

                      <form onSubmit={handleSend} className="flex gap-2 items-end">
                        <div className="flex-1 relative">
                          <textarea
                            value={inputText}
                            onChange={(e) => {
                              setInputText(e.target.value);
                              handleTyping(e);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(e);
                              }
                            }}
                            placeholder={
                              activeChat.status === "pending" 
                                ? `Type your message as ${selectedIntent}... (${getMessageCounter()?.props?.children[1].props.children || '3 max'})` 
                                : `Type your message as ${selectedIntent}...`
                            }
                            className="w-full p-3 pl-4 bg-gray-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none resize-none min-h-[48px] max-h-32 text-gray-700 placeholder-gray-400 transition-all"
                            rows="1"
                            disabled={loading}
                          />
                          
                          {/* Quick actions */}
                          <div className="absolute right-2 bottom-2 flex items-center gap-1">
                            <button type="button" className="p-1.5 text-gray-400 hover:text-gray-600">
                              <Smile size={18} />
                            </button>
                            <button type="button" className="p-1.5 text-gray-400 hover:text-gray-600">
                              <Paperclip size={18} />
                            </button>
                          </div>
                        </div>
                        
                        <button 
                          type="submit" 
                          disabled={!inputText.trim() || loading}
                          className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full hover:opacity-90 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-12 w-12"
                        >
                          <Send size={20} className="ml-0.5" />
                        </button>
                      </form>
                      
                      {/* Status info */}
                      {activeChat.status === "pending" && (
                        <div className="text-center mt-2">
                          <p className="text-xs text-yellow-600 flex items-center justify-center gap-1">
                            <AlertTriangle size={10}/>
                            {getStatusInfo(activeChat.status).description}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
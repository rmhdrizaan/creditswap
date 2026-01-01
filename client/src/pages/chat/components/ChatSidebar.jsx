import { useState } from 'react';
import { 
  Search, Plus, Filter, CheckCircle, 
  Pin, MessageSquare, Users, Archive,
  ChevronRight, Clock, User
} from 'lucide-react';
import { motion } from 'framer-motion';

const ChatSidebar = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  isOpen,
  onClose,
  user
}) => {
  const [filterOpen, setFilterOpen] = useState(false);

  const tabs = [
    { id: 'all', label: 'All', icon: <MessageSquare size={16} />, count: conversations.length },
    { id: 'unread', label: 'Unread', icon: <CheckCircle size={16} />, 
      count: conversations.filter(c => c.unreadCount > 0).length },
    { id: 'pinned', label: 'Pinned', icon: <Pin size={16} />, 
      count: conversations.filter(c => c.isPinned).length },
    { id: 'groups', label: 'Groups', icon: <Users size={16} />, count: 0 },
    { id: 'archived', label: 'Archived', icon: <Archive size={16} />, count: 0 }
  ];

  const filteredConversations = conversations.filter(conv => {
    if (activeTab === 'unread') return conv.unreadCount > 0;
    if (activeTab === 'pinned') return conv.isPinned;
    if (activeTab === 'archived') return conv.isArchived;
    return true;
  });

  const getOtherParticipant = (conversation) => {
    if (!conversation?.participants) return null;
    return conversation.participants.find(p => p._id !== user._id);
  };

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffHours = Math.floor((now - messageDate) / 3600000);
    
    if (diffHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffHours < 48) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      className="fixed md:relative inset-y-0 left-0 z-40 w-80 bg-white border-r border-gray-200 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <Plus size={20} />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search messages"
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2 border-b border-gray-200">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id ? 'bg-white text-blue-500' : 'bg-gray-200'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 border-b border-gray-200">
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-gray-900"
        >
          <div className="flex items-center gap-2">
            <Filter size={16} />
            <span>Filters</span>
          </div>
          <ChevronRight size={16} className={`transition-transform ${filterOpen ? 'rotate-90' : ''}`} />
        </button>
        
        {filterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 space-y-2"
          >
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" className="rounded text-blue-500" />
              <span>Unread only</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" className="rounded text-blue-500" />
              <span>With attachments</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" className="rounded text-blue-500" />
              <span>Starred</span>
            </label>
          </motion.div>
        )}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500">No conversations</p>
            <p className="text-sm text-gray-400 mt-1">
              {activeTab === 'unread' ? 'No unread messages' : 'Start a conversation'}
            </p>
          </div>
        ) : (
          filteredConversations.map(conversation => {
            const otherUser = getOtherParticipant(conversation);
            const isSelected = selectedConversation?._id === conversation._id;
            
            return (
              <div
                key={conversation._id}
                onClick={() => onSelectConversation(conversation)}
                className={`flex items-center p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                  isSelected 
                    ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    {otherUser?.avatar ? (
                      <img 
                        src={otherUser.avatar} 
                        alt={otherUser.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={20} className="text-gray-600" />
                    )}
                  </div>
                  {conversation.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {conversation.unreadCount}
                    </span>
                  )}
                  {conversation.isPinned && (
                    <Pin size={12} className="absolute -bottom-1 -right-1 text-blue-500 bg-white rounded-full p-0.5" />
                  )}
                </div>

                {/* Content */}
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {otherUser?.username || 'Unknown User'}
                      </h3>
                      {conversation.relatedListing && (
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                          Job
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {conversation.latestMessage?.createdAt && (
                        <span className="text-xs text-gray-400">
                          {formatTime(conversation.latestMessage.createdAt)}
                        </span>
                      )}
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                  
                  {/* Job Context */}
                  {conversation.jobTitle && (
                    <p className="text-xs text-blue-600 font-medium truncate mb-1">
                      {conversation.jobTitle}
                    </p>
                  )}
                  
                  {/* Last Message */}
                  <div className="flex items-center gap-1">
                    <p className="text-sm text-gray-500 truncate flex-1">
                      {conversation.latestMessage ? (
                        <>
                          {conversation.latestMessage.sender._id === user._id && (
                            <span className="text-gray-400 mr-1">You:</span>
                          )}
                          {conversation.latestMessage.content 
                            ? conversation.latestMessage.content.substring(0, 30) + 
                              (conversation.latestMessage.content.length > 30 ? '...' : '')
                            : '📎 Attachment'
                          }
                        </>
                      ) : (
                        <span className="italic text-gray-400">Start a conversation</span>
                      )}
                    </p>
                    
                    {/* Status Indicators */}
                    <div className="flex items-center gap-1">
                      {conversation.latestMessage?.type === 'image' && (
                        <Image size={12} className="text-gray-400" />
                      )}
                      {conversation.latestMessage?.type === 'file' && (
                        <Paperclip size={12} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* User Status */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.username}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="font-semibold text-indigo-700">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{user?.username}</p>
            <p className="text-xs text-green-600">Online</p>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Clock size={18} className="text-gray-600" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatSidebar;
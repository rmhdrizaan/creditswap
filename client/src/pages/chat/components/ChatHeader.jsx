import { 
    ChevronLeft, MoreVertical, Phone, Video, 
    Info, Users, Pin, Bell, BellOff, User,
    Star, Archive, Trash2, VolumeX, Volume2,
    Mail, Download, Eye, EyeOff, Calendar,
    Grid, List, Hash, AtSign, ExternalLink,
    Shield, Lock, Unlock, Settings, HelpCircle
  } from 'lucide-react';
  import { useState } from 'react';
  
  const ChatHeader = ({ 
    conversation, 
    otherUser, 
    user, 
    onBack, 
    onMenuToggle 
  }) => {
    const [isMuted, setIsMuted] = useState(conversation?.isMuted || false);
    const [isPinned, setIsPinned] = useState(conversation?.isPinned || false);
  
    const handleMuteToggle = () => {
      setIsMuted(!isMuted);
      // Call API to update conversation mute status
    };
  
    const handlePinToggle = () => {
      setIsPinned(!isPinned);
      // Call API to update conversation pin status
    };
  
    const getStatusColor = (status) => {
      switch (status) {
        case 'online': return 'bg-green-500';
        case 'away': return 'bg-yellow-500';
        case 'busy': return 'bg-red-500';
        default: return 'bg-gray-400';
      }
    };
  
    return (
      <div className="h-16 px-4 md:px-6 border-b border-gray-200 bg-white/95 backdrop-blur-sm flex items-center justify-between sticky top-0 z-30">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="md:hidden p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft size={24} />
          </button>
          
          {/* Avatar & Info */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden">
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
              <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor('online')} border-2 border-white rounded-full`}></div>
            </div>
            
            <div>
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                {otherUser?.username || 'Unknown User'}
                {conversation?.relatedListing && (
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                    Job Chat
                  </span>
                )}
              </h2>
              
              {/* Status & Context */}
              <div className="flex items-center gap-3">
                <p className="text-xs text-green-600 font-medium">Online</p>
                
                {conversation?.jobTitle && (
                  <>
                    <span className="text-gray-300">•</span>
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">
                      {conversation.jobTitle}
                    </p>
                  </>
                )}
                
                {conversation?.stage && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      conversation.stage === 'work' 
                        ? 'bg-green-100 text-green-800'
                        : conversation.stage === 'negotiation'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {conversation.stage}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
  
        {/* Right Section - Actions */}
        <div className="flex items-center gap-1">
          {/* Quick Actions */}
          <button 
            onClick={handlePinToggle}
            className={`p-2 rounded-full hover:bg-gray-100 ${isPinned ? 'text-blue-500' : 'text-gray-600'}`}
            title={isPinned ? 'Unpin chat' : 'Pin chat'}
          >
            <Pin size={20} />
          </button>
          
          <button 
            onClick={handleMuteToggle}
            className={`p-2 rounded-full hover:bg-gray-100 ${isMuted ? 'text-red-500' : 'text-gray-600'}`}
            title={isMuted ? 'Unmute notifications' : 'Mute notifications'}
          >
            {isMuted ? <BellOff size={20} /> : <Bell size={20} />}
          </button>
          
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600" title="Video call">
            <Video size={20} />
          </button>
          
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600" title="Voice call">
            <Phone size={20} />
          </button>
          
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600" title="Chat info">
            <Info size={20} />
          </button>
          
          <button 
            onClick={onMenuToggle}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
            title="More options"
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </div>
    );
  };
  
  export default ChatHeader;
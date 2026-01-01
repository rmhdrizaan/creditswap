import { useState } from 'react';
import { 
  Check, CheckCheck, Clock, Reply, ThumbsUp, 
  Trash2, Edit, Copy, Flag, Download, Eye,
  Image as ImageIcon, FileText, Link, Mic,
  MoreVertical, X, Smile, Star, Share2,
  CornerUpLeft, CornerUpRight, Hash, AtSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MessageBubble = ({ 
  message, 
  isMine, 
  showAvatar, 
  onReply, 
  onReaction,
  onDelete,
  user,
  isSelected
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageStatus = (msg) => {
    if (msg.sender._id !== user._id) return null;
    
    if (msg.readBy?.length > 1) {
      return <CheckCheck size={12} className="text-blue-500" />;
    } else if (msg.readBy?.length === 1) {
      return <CheckCheck size={12} className="text-gray-400" />;
    } else {
      return <Check size={12} className="text-gray-400" />;
    }
  };

  const commonReactions = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🎉'];

  const renderMessageContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <div className="max-w-xs">
            <img 
              src={message.file?.url} 
              alt={message.file?.name || 'Image'}
              className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.file?.url, '_blank')}
            />
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        );
      
      case 'file':
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-w-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{message.file?.name}</p>
                <p className="text-xs text-gray-500">
                  {(message.file?.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button 
                onClick={() => window.open(message.file?.url, '_blank')}
                className="p-1 hover:bg-gray-200 rounded"
                title="Download"
              >
                <Download size={16} />
              </button>
            </div>
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        );
      
      case 'system':
        return (
          <div className="text-center">
            <div className="inline-block bg-gray-100 text-gray-600 text-sm px-4 py-1.5 rounded-full">
              {message.content}
            </div>
          </div>
        );
      
      default:
        return <p className="whitespace-pre-wrap">{message.content}</p>;
    }
  };

  return (
    <div 
      className={`flex ${isMine ? 'justify-end' : 'justify-start'} group relative`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Other User's Avatar */}
      {showAvatar && !isMine && (
        <div className="self-end mr-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden">
            {message.sender.avatar ? (
              <img 
                src={message.sender.avatar} 
                alt={message.sender.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-medium text-sm text-gray-600">
                {message.sender.username?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Message Container */}
      <div className={`max-w-[70%] ${!isMine && !showAvatar ? 'ml-10' : ''}`}>
        {/* Sender Name */}
        {!isMine && showAvatar && (
          <p className="text-xs font-medium text-gray-500 mb-1 ml-1">
            {message.sender.username}
          </p>
        )}
        
        {/* Reply Preview */}
        {message.replyTo && (
          <div className={`mb-1 p-2 rounded-lg border-l-2 ${
            isMine ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-100'
          }`}>
            <p className="text-xs font-medium text-gray-600">
              {message.replyTo.sender.username}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {message.replyTo.content || 'Attachment'}
            </p>
          </div>
        )}
        
        {/* Message Bubble */}
        <div className={`relative group/bubble ${
          isSelected ? 'ring-2 ring-blue-300' : ''
        }`}>
          <div
            className={`px-4 py-2.5 rounded-2xl shadow-sm ${
              isMine 
                ? 'bg-blue-500 text-white rounded-br-sm' 
                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
            } ${message.type === 'system' ? 'bg-transparent border-0 shadow-none p-0' : ''}`}
          >
            {renderMessageContent()}
            
            {/* Message Footer */}
            {message.type !== 'system' && (
              <div className={`flex items-center justify-end mt-1.5 ${
                isMine ? 'text-blue-100' : 'text-gray-400'
              }`}>
                <span className="text-xs mr-2">
                  {formatTime(message.createdAt)}
                </span>
                {getMessageStatus(message)}
              </div>
            )}
          </div>
          
          {/* Message Actions (Hover) */}
          <AnimatePresence>
            {showActions && message.type !== 'system' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className={`absolute top-1/2 transform -translate-y-1/2 flex items-center gap-1 ${
                  isMine ? '-left-14' : '-right-14'
                }`}
              >
                {/* Quick Reactions */}
                <div className="flex items-center gap-1 bg-white shadow-lg rounded-full px-2 py-1">
                  {commonReactions.slice(0, 3).map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => onReaction(message._id, emoji)}
                      className="hover:scale-110 transition-transform p-1"
                    >
                      {emoji}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowReactions(!showReactions)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <Smile size={14} />
                  </button>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-1 bg-white shadow-lg rounded-full px-2 py-1">
                  <button
                    onClick={() => onReply(message)}
                    className="p-1.5 hover:bg-gray-100 rounded-full"
                    title="Reply"
                  >
                    <Reply size={14} />
                  </button>
                  
                  {isMine && (
                    <>
                      <button
                        onClick={() => {/* Edit logic */}}
                        className="p-1.5 hover:bg-gray-100 rounded-full"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(message._id)}
                        className="p-1.5 hover:bg-red-100 rounded-full text-red-500"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => navigator.clipboard.writeText(message.content)}
                    className="p-1.5 hover:bg-gray-100 rounded-full"
                    title="Copy"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Full Reactions Picker */}
          <AnimatePresence>
            {showReactions && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className={`absolute ${
                  isMine ? 'right-0' : 'left-0'
                } bottom-full mb-2 bg-white border border-gray-200 rounded-xl shadow-2xl p-2 z-50`}
              >
                <div className="grid grid-cols-4 gap-1">
                  {commonReactions.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onReaction(message._id, emoji);
                        setShowReactions(false);
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
        
        {/* Reactions */}
        {message.reactions?.length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
            {message.reactions.reduce((acc, reaction) => {
              const existing = acc.find(r => r.emoji === reaction.emoji);
              if (existing) {
                existing.count++;
              } else {
                acc.push({ emoji: reaction.emoji, count: 1 });
              }
              return acc;
            }, []).map((reaction, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  reaction.count > 1 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                <span>{reaction.emoji}</span>
                {reaction.count > 1 && <span>{reaction.count}</span>}
              </div>
            ))}
          </div>
        )}
        
        {/* Edited Indicator */}
        {message.edited && (
          <p className={`text-xs text-gray-400 mt-1 ${isMine ? 'text-right' : 'text-left'}`}>
            Edited
          </p>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
import { useState, useRef, useEffect } from 'react';
import {
  Send, Smile, Image, Paperclip, Mic,
  X, AtSign, Hash, Bold, Italic,
  List, ListOrdered, Link, Code,
  CornerUpLeft, CornerUpRight, Type,
  Calendar, MapPin, Camera, Video,
  FileUp, Music, Archive, Star,
  HelpCircle, Zap, Moon, Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MessageInput = ({
  onSendMessage,
  onTyping,
  replyTo,
  onCancelReply,
  onFileUpload,
  showEmojiPicker,
  onToggleEmojiPicker,
  fileInputRef,
  disabled = false
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const textareaRef = useRef(null);

  const emojis = [
    '😀', '😂', '🥰', '😎', '🤔', '👏', '🎉', '🔥',
    '👍', '❤️', '✨', '💯', '🚀', '📚', '💼', '💰',
    '⏰', '✅', '❌', '⚠️', 'ℹ️', '🔗', '📎', '📍',
    '🎨', '🔧', '📊', '💡', '🤝', '🏆', '🎯', '🔄'
  ];

  const handleSend = (e) => {
    e?.preventDefault();
    if (!message.trim() && !disabled) return;
    
    onSendMessage(message);
    setMessage('');
    
    // Clear typing indicator
    if (onTyping) {
      onTyping.cancel?.();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    
    // Trigger typing indicator
    if (onTyping) {
      onTyping();
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      onFileUpload(files);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    // Voice recording logic would go here
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Stop recording logic
  };

  const formattingOptions = [
    { icon: <Bold size={16} />, action: () => insertFormatting('**bold**') },
    { icon: <Italic size={16} />, action: () => insertFormatting('*italic*') },
    { icon: <List size={16} />, action: () => insertFormatting('- list item') },
    { icon: <ListOrdered size={16} />, action: () => insertFormatting('1. ordered') },
    { icon: <Code size={16} />, action: () => insertFormatting('`code`') },
    { icon: <Link size={16} />, action: () => insertFormatting('[link](url)') },
  ];

  const insertFormatting = (format) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = message.substring(start, end);
    
    const newText = message.substring(0, start) + 
                   (selectedText ? format.replace('text', selectedText) : format) + 
                   message.substring(end);
    
    setMessage(newText);
    
    // Focus and position cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + format.length,
        start + format.length + (selectedText?.length || 0)
      );
    }, 0);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {/* Reply Preview */}
      {replyTo && (
        <div className="mb-3">
          <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CornerUpLeft size={14} className="text-blue-600" />
                <span className="text-xs font-medium text-blue-600">
                  Replying to {replyTo.sender.username}
                </span>
              </div>
              <p className="text-sm text-blue-800 truncate">
                {replyTo.content || 'Attachment'}
              </p>
            </div>
            <button
              onClick={onCancelReply}
              className="p-1 hover:bg-blue-100 rounded-full transition-colors"
            >
              <X size={16} className="text-blue-600" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSend} className="space-y-3">
        {/* Formatting Bar */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowFormatting(!showFormatting)}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            title="Formatting"
          >
            <Type size={16} />
          </button>
          
          <AnimatePresence>
            {showFormatting && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1"
              >
                {formattingOptions.map((option, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={option.action}
                    className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
                    title={option.title}
                  >
                    {option.icon}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex-1" />
          
          <button
            type="button"
            onClick={() => onToggleEmojiPicker()}
            className={`p-1.5 rounded ${showEmojiPicker ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
            title="Emoji"
          >
            <Smile size={16} />
          </button>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            title="Attach file"
          >
            <Paperclip size={16} />
          </button>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            title="Add image"
          >
            <Image size={16} />
          </button>
        </div>

        {/* Emoji Picker */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-white border border-gray-200 rounded-xl shadow-xl p-3"
            >
              <div className="grid grid-cols-8 gap-1 mb-2">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleEmojiSelect(emoji)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-xl"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Frequently used</span>
                <button className="text-blue-500 hover:text-blue-600">
                  More emojis
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Input Area */}
        <div className="flex items-end gap-3">
          {/* Voice Recording Button */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-3 rounded-full transition-all ${
              isRecording 
                ? 'bg-red-100 text-red-600 animate-pulse' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            title={isRecording ? 'Stop recording' : 'Voice message'}
          >
            <Mic size={20} />
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="iMessage"
              className="w-full min-h-[44px] max-h-[120px] px-4 py-3 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="1"
              disabled={disabled}
            />
            
            {/* Quick Actions */}
            <div className="absolute right-3 bottom-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleEmojiSelect('@')}
                className="text-gray-400 hover:text-gray-600"
                title="Mention"
              >
                <AtSign size={16} />
              </button>
              <button
                type="button"
                onClick={() => handleEmojiSelect('#')}
                className="text-gray-400 hover:text-gray-600"
                title="Tag"
              >
                <Hash size={16} />
              </button>
            </div>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className={`p-3 rounded-full transition-all ${
              message.trim() && !disabled
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send size={20} />
          </button>
        </div>

        {/* File Upload Hint */}
        <div className="text-xs text-gray-400 text-center">
          Drop files here or click to upload • Max 25MB • Supports images, PDF, docs
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt,.zip"
          multiple
          onChange={handleFileSelect}
        />
      </form>
    </div>
  );
};

export default MessageInput;
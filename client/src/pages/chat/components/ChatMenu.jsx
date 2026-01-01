import { useState } from 'react';
import { 
  MoreVertical, Phone, Video, Info, Users,
  Pin, Bell, BellOff, Star, Archive, Trash2,
  VolumeX, Volume2, Mail, Download, Eye, EyeOff,
  Calendar, Grid, List, Hash, AtSign, ExternalLink,
  Shield, Lock, Unlock, Settings, HelpCircle, Copy,
  Flag, UserPlus, UserMinus, QrCode, BookOpen,
  Globe, Moon, Sun, Zap, Heart, Award, Target,
  CornerUpLeft, CornerUpRight, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatMenu = ({ isOpen, onClose, conversation, user }) => {
  const [activeSection, setActiveSection] = useState('main');

  const menuSections = {
    main: [
      { icon: <Pin size={18} />, label: conversation?.isPinned ? 'Unpin Chat' : 'Pin Chat', color: 'text-blue-600' },
      { icon: conversation?.isMuted ? <Bell size={18} /> : <BellOff size={18} />, 
        label: conversation?.isMuted ? 'Unmute Notifications' : 'Mute Notifications', 
        color: conversation?.isMuted ? 'text-red-600' : 'text-gray-700' },
      { icon: <Star size={18} />, label: 'Star Chat', color: 'text-yellow-600' },
      { icon: <Users size={18} />, label: 'Add Participants', color: 'text-green-600' },
      { icon: <Eye size={18} />, label: 'Mark as Unread', color: 'text-purple-600' },
      { icon: <Archive size={18} />, label: 'Archive Chat', color: 'text-gray-600' },
    ],
    media: [
      { icon: <Grid size={18} />, label: 'Photos & Videos', count: 12 },
      { icon: <FileText size={18} />, label: 'Documents', count: 5 },
      { icon: <Link size={18} />, label: 'Links', count: 8 },
      { icon: <Music size={18} />, label: 'Audio', count: 3 },
    ],
    settings: [
      { icon: <Lock size={18} />, label: 'Privacy & Security' },
      { icon: <Bell size={18} />, label: 'Notifications' },
      { icon: <EyeOff size={18} />, label: 'Read Receipts' },
      { icon: <Download size={18} />, label: 'Data & Storage' },
      { icon: <Shield size={18} />, label: 'Block User' },
    ],
    tools: [
      { icon: <Calendar size={18} />, label: 'Schedule Meeting' },
      { icon: <ExternalLink size={18} />, label: 'Share Chat' },
      { icon: <Copy size={18} />, label: 'Copy Chat Link' },
      { icon: <QrCode size={18} />, label: 'QR Code' },
      { icon: <BookOpen size={18} />, label: 'Export Chat' },
    ]
  };

  const renderSection = () => {
    const section = menuSections[activeSection];
    
    return (
      <div className="py-2">
        {/* Back Button for sub-sections */}
        {activeSection !== 'main' && (
          <button
            onClick={() => setActiveSection('main')}
            className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-600 hover:bg-gray-50"
          >
            <CornerUpLeft size={18} />
            Back to Main Menu
          </button>
        )}
        
        {/* Section Items */}
        {section.map((item, index) => (
          <button
            key={index}
            className={`flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 ${
              item.color || 'text-gray-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded ${
                item.color?.replace('text-', 'bg-') + '20' || 'bg-gray-100'
              }`}>
                {item.icon}
              </div>
              <span>{item.label}</span>
            </div>
            {item.count !== undefined ? (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {item.count}
              </span>
            ) : (
              <ChevronRight size={16} className="text-gray-400" />
            )}
          </button>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-25 z-40"
        onClick={onClose}
      />
      
      {/* Menu */}
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed right-0 top-0 bottom-0 w-80 md:w-96 bg-white shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {activeSection === 'main' ? 'Chat Options' : 
               activeSection === 'media' ? 'Media' :
               activeSection === 'settings' ? 'Settings' : 'Tools'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Conversation Info */}
          {conversation && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <Users size={20} className="text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {conversation.participants?.length || 2} participants
                  </p>
                  <p className="text-sm text-gray-500">
                    Created {new Date(conversation.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {conversation && (
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">128</div>
                <div className="text-xs text-gray-500">Messages</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">24</div>
                <div className="text-xs text-gray-500">Files</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">7</div>
                <div className="text-xs text-gray-500">Days active</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-6 py-3 border-b border-gray-200">
          <div className="flex gap-2 overflow-x-auto">
            {Object.keys(menuSections).map(section => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeSection === section
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Content */}
        <div className="flex-1 overflow-y-auto">
          {renderSection()}
        </div>

        {/* Danger Zone */}
        {activeSection === 'main' && (
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Danger Zone
            </h3>
            <div className="space-y-2">
              <button className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg">
                <Trash2 size={18} />
                Delete Chat
              </button>
              <button className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg">
                <UserMinus size={18} />
                Block User
              </button>
              <button className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg">
                <Flag size={18} />
                Report Chat
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Chat ID: {conversation?._id?.substring(0, 8) || 'N/A'}
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded">
                <Settings size={16} />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded">
                <HelpCircle size={16} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

// Add missing import
import { X } from 'lucide-react';

export default ChatMenu;
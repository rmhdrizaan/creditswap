import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ChatButton = ({ 
  userId, 
  listingId, 
  offerId, 
  title, 
  variant = 'default',
  className = '' 
}) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChatClick = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (userId === user._id) {
      alert("You cannot chat with yourself");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/chat/conversation', {
        userId,
        listingId,
        offerId,
        title
      });

      if (response.data) {
        navigate(`/chat/${response.data._id}`);
      }
    } catch (error) {
      console.error('Failed to start chat:', error);
      alert(error.response?.data?.message || 'Failed to start chat');
    } finally {
      setLoading(false);
    }
  };

  const variants = {
    default: 'bg-blue-500 hover:bg-blue-600 text-white',
    outline: 'border border-blue-500 text-blue-500 hover:bg-blue-50',
    ghost: 'text-blue-500 hover:bg-blue-50',
    danger: 'bg-red-500 hover:bg-red-600 text-white'
  };

  return (
    <button
      onClick={handleChatClick}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      <MessageSquare size={18} />
      {loading ? 'Starting chat...' : 'Chat'}
    </button>
  );
};

export default ChatButton;
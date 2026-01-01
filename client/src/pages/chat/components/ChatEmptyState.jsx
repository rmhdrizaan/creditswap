import { 
    MessageSquare, Users, Briefcase, Zap,
    Search, Plus, Star, Globe, Rocket,
    Award, Target, Heart, Shield, Lock,
    Bell, Mail, Phone, Video, Calendar,
    FileText, Image, Link, Download
  } from 'lucide-react';
  import { motion } from 'framer-motion';
  
  const ChatEmptyState = ({ onCreateChat, user }) => {
    const features = [
      {
        icon: <Briefcase className="text-blue-500" size={20} />,
        title: "Job Discussions",
        description: "Chat about specific jobs and offers"
      },
      {
        icon: <Shield className="text-green-500" size={20} />,
        title: "Secure & Private",
        description: "End-to-end encrypted conversations"
      },
      {
        icon: <Zap className="text-yellow-500" size={20} />,
        title: "Real-time",
        description: "Instant messaging with typing indicators"
      },
      {
        icon: <FileText className="text-purple-500" size={20} />,
        title: "File Sharing",
        description: "Share images, documents, and links"
      }
    ];
  
    const quickActions = [
      { label: "Browse Marketplace", icon: <Globe />, action: () => window.location.href = '/marketplace' },
      { label: "Post a Job", icon: <Plus />, action: () => window.location.href = '/post-job' },
      { label: "View Offers", icon: <Bell />, action: () => window.location.href = '/my-bids' },
      { label: "My Listings", icon: <Briefcase />, action: () => window.location.href = '/my-listings' },
    ];
  
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl"
        >
          {/* Animated Icon */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
              <MessageSquare size={40} className="text-white" />
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Users size={16} className="text-green-600" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Star size={16} className="text-yellow-600" />
            </div>
          </div>
  
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Welcome to Messages, {user?.username}!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
            Connect with job posters, discuss details, and coordinate work securely.
            Your conversations are organized by job context for easy reference.
          </p>
  
          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center mb-3 mx-auto">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </motion.div>
            ))}
          </div>
  
          {/* Quick Actions */}
          <div className="mb-10">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={action.action}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  {action.icon}
                  <span className="font-medium text-gray-700">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
  
          {/* Stats */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 border border-blue-100">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-700">0</div>
                <div className="text-sm text-blue-600">Active Chats</div>
              </div>
              <div className="h-8 w-px bg-blue-200"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-700">0</div>
                <div className="text-sm text-purple-600">Unread</div>
              </div>
              <div className="h-8 w-px bg-purple-200"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">{user?.credits || 0}</div>
                <div className="text-sm text-green-600">Credits</div>
              </div>
            </div>
          </div>
  
          {/* Tips */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Target className="text-yellow-600" size={20} />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-yellow-800 mb-1">Pro Tip</h4>
                <p className="text-sm text-yellow-700">
                  Start a chat from a job listing or offer to keep conversations organized by context.
                  This helps track discussions specific to each job or project.
                </p>
              </div>
            </div>
          </div>
  
          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = '/marketplace'}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <Rocket size={20} />
            <span>Browse Jobs to Start Chatting</span>
          </motion.button>
  
          {/* Footer Note */}
          <p className="mt-6 text-sm text-gray-400">
            Need help? <a href="/help" className="text-blue-500 hover:text-blue-600">Visit our help center</a>
          </p>
        </motion.div>
      </div>
    );
  };
  
  export default ChatEmptyState;
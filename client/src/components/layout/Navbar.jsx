import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserProfile } from "../../services/userService";
import {
  getMyNotifications,
  markNotificationRead,
} from "../../services/notificationService";
import {
  Menu,
  X,
  Zap,
  LogOut,
  User,
  LayoutGrid,
  Briefcase,
  PlusCircle,
  Bell,
  FileText,
  Home as HomeIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [currentCredits, setCurrentCredits] = useState(0);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /* Scroll effect */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Close mobile menu on route change */
  useEffect(() => setMobileOpen(false), [location]);

  /* Poll notifications + credits */
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [notifs, profile] = await Promise.all([
          getMyNotifications(),
          getUserProfile(user._id),
        ]);

        setNotifications(Array.isArray(notifs) ? notifs : []);
        setCurrentCredits(profile?.credits ?? 0);
      } catch (err) {
        console.error("Navbar fetch error:", err);
        setNotifications([]);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, [user]);

  /* ✅ SAFE unread count (never crashes) */
  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n.read).length
    : 0;

  const handleNotifClick = async (n) => {
    try {
      if (!n.read) await markNotificationRead(n._id);
    } catch (err) {
      console.error("Mark notification read failed:", err);
    }
    setNotifOpen(false);

    if (n.type === "offer_received") navigate("/my-listings");
    if (n.type === "offer_accepted") navigate("/my-work");
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <Link to={user ? "/home" : "/"} className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/30">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="text-xl font-bold text-slate-800">
              CreditSwap
            </span>
          </Link>
          <span className="hidden lg:block text-xs font-bold uppercase tracking-wider text-slate-400 border-l border-slate-300 pl-4">
            Trade Time. Build Value.
          </span>
        </div>

        {/* CENTER */}
        {user && (
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/home" icon={<HomeIcon size={16} />} label="Home" />
            <NavLink to="/marketplace" icon={<LayoutGrid size={16} />} label="Marketplace" />
            <NavLink to="/my-work" icon={<Briefcase size={16} />} label="My Work" />
            <NavLink to="/my-listings" icon={<FileText size={16} />} label="Listings" />
          </div>
        )}

        {/* RIGHT */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              {/* Credits */}
              <Link
                to="/wallet"
                className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-full shadow-lg"
              >
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-green-400"
                />
                <span className="font-bold text-sm">
                  {currentCredits.toFixed(1)} CR
                </span>
              </Link>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen((v) => !v)}
                  className="p-2 text-slate-500 hover:text-indigo-600 relative"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border overflow-hidden"
                    >
                      <div className="p-3 text-xs font-bold text-slate-500 uppercase bg-slate-50">
                        Updates
                      </div>

                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-center text-xs text-slate-400">
                            All caught up!
                          </p>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              onClick={() => handleNotifClick(n)}
                              className={`p-3 text-sm cursor-pointer hover:bg-slate-50 ${
                                !n.read ? "bg-indigo-50/30" : ""
                              }`}
                            >
                              <p className="font-medium">{n.message}</p>
                              <p className="text-[10px] text-slate-400 mt-1">
                                {new Date(n.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Post */}
              <Link to="/post-job">
                <button className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center">
                  <PlusCircle size={20} />
                </button>
              </Link>

              {/* Profile */}
              <div className="relative group border-l pl-3">
                <button className="w-9 h-9 rounded-full bg-indigo-100 font-bold text-indigo-700">
                  {user.username[0].toUpperCase()}
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link to="/profile" className="dropdown-item">
                    <User size={16} /> Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="dropdown-item text-red-500 hover:bg-red-50"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="font-bold text-slate-600">Log In</Link>
              <Link to="/signup" className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>
    </nav>
  );
}

/* Reusable NavLink */
const NavLink = ({ to, icon, label }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 text-sm font-medium ${
        active ? "text-indigo-600" : "text-slate-500 hover:text-indigo-600"
      }`}
    >
      {icon} {label}
    </Link>
  );
};



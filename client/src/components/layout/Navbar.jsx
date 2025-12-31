import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Menu, X, Zap, LogOut, User, 
  ChevronDown, LayoutGrid, PlusCircle, 
  Briefcase, Wallet, Settings, ShieldCheck 
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // --- NAVIGATION LINKS CONFIG ---
  const publicLinks = [
    { name: "About", path: "/about" },
    { name: "How it Works", path: "/#how-it-works" }, // Anchor link
  ];

  const userLinks = [
    { name: "Marketplace", path: "/marketplace", icon: LayoutGrid },
    { name: "My Work", path: "/my-listings", icon: Briefcase },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-border py-3" 
        : "bg-transparent py-5"
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* 1. LOGO */}
        <Link to={user ? "/marketplace" : "/"} className="flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-gradient-to-tr from-primary to-purple-600 p-2 rounded-xl text-white shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
              <Zap size={22} fill="currentColor" />
            </div>
          </div>
          <span className="text-xl font-bold font-heading tracking-tight text-slateText">
            CreditSwap
          </span>
        </Link>

        {/* 2. DESKTOP NAVIGATION */}
        <div className="hidden md:flex items-center gap-8">
          
          {/* Middle Links */}
          <div className="flex items-center gap-6">
            {!user && publicLinks.map(link => (
              <Link 
                key={link.name} 
                to={link.path}
                className="text-sm font-medium text-mutedText hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}

            {user && userLinks.map(link => (
              <Link 
                key={link.name} 
                to={link.path}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  location.pathname === link.path ? "text-primary" : "text-mutedText hover:text-primary"
                }`}
              >
                {link.icon && <link.icon size={16} />}
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Admin Badge */}
                {user.role === 'admin' && (
                  <Link to="/admin" className="px-3 py-1 bg-slate-800 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <ShieldCheck size={12} /> Admin
                  </Link>
                )}

                {/* Post Job Button */}
                <Link to="/post-job">
                  <button className="flex items-center gap-2 px-4 py-2 bg-slateText text-white text-sm font-bold rounded-xl shadow-lg hover:bg-slate-700 transition-all transform hover:-translate-y-0.5">
                    <PlusCircle size={16} /> Post Job
                  </button>
                </Link>

                {/* Credits Badge (Clickable) */}
                <Link to="/wallet" className="group flex items-center gap-2 px-3 py-1.5 bg-white border border-border rounded-full hover:border-primary/50 transition-colors shadow-sm">
                  <div className="w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                    <Zap size={12} fill="currentColor"/>
                  </div>
                  <span className="text-sm font-bold text-slateText group-hover:text-primary">
                    {user.credits}
                  </span>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 pl-2 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border border-white shadow-sm flex items-center justify-center text-primary font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown size={14} className="text-mutedText" />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-border overflow-hidden p-2"
                      >
                        <div className="px-3 py-2 border-b border-slate-100 mb-2">
                          <p className="text-sm font-bold text-slateText">{user.username}</p>
                          <p className="text-xs text-mutedText truncate">{user.email}</p>
                        </div>
                        
                        <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary rounded-xl transition-colors">
                          <User size={16} /> Profile
                        </Link>
                        <Link to="/wallet" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary rounded-xl transition-colors">
                          <Wallet size={16} /> Wallet
                        </Link>
                        <Link to="/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary rounded-xl transition-colors">
                          <Settings size={16} /> Settings
                        </Link>
                        
                        <div className="h-px bg-slate-100 my-2" />
                        
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-danger hover:bg-red-50 rounded-xl transition-colors text-left"
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              // Logged Out Actions
              <>
                <Link to="/login" className="hidden sm:block text-sm font-semibold text-mutedText hover:text-primary transition-colors">
                  Log In
                </Link>
                <Link to="/signup">
                  <button className="px-5 py-2.5 bg-primary hover:bg-primaryHover text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/25 transition-all transform hover:-translate-y-0.5">
                    Get Started
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* 3. MOBILE TOGGLE */}
        <button 
          className="md:hidden p-2 text-slateText hover:bg-slate-100 rounded-lg transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 4. MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: "auto", opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-white border-b border-border shadow-2xl absolute top-full w-full"
          >
            <div className="p-6 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                       {user.username.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slateText">{user.username}</p>
                      <p className="text-xs text-secondary font-bold flex items-center gap-1">
                        <Zap size={10} fill="currentColor"/> {user.credits} Credits
                      </p>
                    </div>
                  </div>
                  
                  {userLinks.map(link => (
                    <Link key={link.name} to={link.path} className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium">
                      {link.icon && <link.icon size={18}/>} {link.name}
                    </Link>
                  ))}
                  
                  <Link to="/post-job" className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium">
                    <PlusCircle size={18}/> Post a Job
                  </Link>
                  <Link to="/profile" className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium">
                    <User size={18}/> Profile
                  </Link>

                  <div className="h-px bg-slate-100 my-2" />
                  
                  <button onClick={handleLogout} className="flex items-center gap-3 p-3 text-danger hover:bg-red-50 rounded-xl font-bold w-full text-left">
                    <LogOut size={18}/> Sign Out
                  </button>
                </>
              ) : (
                <>
                  {publicLinks.map(link => (
                    <Link key={link.name} to={link.path} className="block p-3 text-lg font-medium text-slate-600 hover:text-primary">
                      {link.name}
                    </Link>
                  ))}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <Link to="/login" className="py-3 text-center border border-border rounded-xl font-bold text-slateText hover:bg-slate-50">Log In</Link>
                    <Link to="/signup" className="py-3 text-center bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20">Get Started</Link>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
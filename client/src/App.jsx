import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Layout
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Public Pages
import Landing from "./pages/Landing";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import About from "./pages/About";

// Protected Pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import PostJob from "./pages/PostJob";
import ListingDetail from "./pages/ListingDetail";
import MyListings from "./pages/MyListings";
import ManageJob from "./pages/ManageJob";
import MyWork from "./pages/MyWork";
import MyBids from "./pages/MyBids";
import Wallet from "./pages/wallet/Wallet";
import CreditPurchase from "./pages/CreditPurchase";
import Profile from "./pages/profile/Profile";
import Settings from "./pages/profile/Settings";
import Chat from "./pages/chat/Chat";

/* 🔒 Protected Route */
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

/* 🌍 Public Route */
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/home" replace /> : children;
};

/* 🧱 Layout */
const Layout = ({ children }) => (
  <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
    <Navbar />
    <main className="flex-grow">{children}</main>
    <Footer />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* PUBLIC */}
            <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/about" element={<About />} />

            {/* HOME */}
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />

            {/* CORE */}
            <Route path="/marketplace" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/services/:id" element={<ProtectedRoute><ListingDetail /></ProtectedRoute>} />
            <Route path="/post-job" element={<ProtectedRoute><PostJob /></ProtectedRoute>} />

            {/* WORK */}
            <Route path="/my-listings" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
            <Route path="/my-listings/:id/manage" element={<ProtectedRoute><ManageJob /></ProtectedRoute>} />
            <Route path="/my-work" element={<ProtectedRoute><MyWork /></ProtectedRoute>} />
            <Route path="/my-bids" element={<ProtectedRoute><MyBids /></ProtectedRoute>} />

            {/* CHAT */}
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/chat/:conversationId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

            {/* WALLET */}
            <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
            <Route path="/buy-credits" element={<ProtectedRoute><CreditPurchase /></ProtectedRoute>} />

            {/* PROFILE */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* FALLBACK */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
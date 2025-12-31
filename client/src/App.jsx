import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// --- Layout ---
import Navbar from "./components/layout/Navbar";

// --- Public Pages ---
import Landing from "./pages/Landing";
import About from "./pages/About";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";

// --- App Pages ---
import Dashboard from "./pages/Dashboard";
import PostJob from "./pages/PostJob";
import ListingDetail from "./pages/ListingDetail";
import MyListings from "./pages/MyListings";
import ManageJob from "./pages/ManageJob";
import Wallet from "./pages/wallet/Wallet";
import Profile from "./pages/profile/Profile";
import MyWork from "./pages/MyWork"; // ✅ NEW

// --- Route Guard ---
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

// --- Layout Wrapper ---
const Layout = ({ children }) => (
  <div className="min-h-screen bg-background text-slateText font-sans selection:bg-primary/20">
    <Navbar />
    {children}
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* 🌍 PUBLIC ROUTES */}
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* 🔐 PROTECTED ROUTES */}
            <Route
              path="/marketplace"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/services/:id"
              element={
                <ProtectedRoute>
                  <ListingDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/post-job"
              element={
                <ProtectedRoute>
                  <PostJob />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-listings"
              element={
                <ProtectedRoute>
                  <MyListings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-listings/:id/manage"
              element={
                <ProtectedRoute>
                  <ManageJob />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-work"
              element={
                <ProtectedRoute>
                  <MyWork />
                </ProtectedRoute>
              }
            />

            <Route
              path="/wallet"
              element={
                <ProtectedRoute>
                  <Wallet />
                </ProtectedRoute>
              }
            />

            {/* 👤 PROFILE ROUTES */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile/:id"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* ❌ FALLBACK */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

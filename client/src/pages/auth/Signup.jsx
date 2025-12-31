import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { User, Mail, Lock, Loader } from "lucide-react";

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await signupUser(form);
      login(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white">
      {/* Left: Branding */}
      <div className="hidden md:flex flex-col justify-center p-12 bg-slate-50 relative overflow-hidden">
         <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
         <div className="relative z-10">
            <h2 className="text-4xl font-heading font-bold text-slateText mb-6">Join the Economy of Skills.</h2>
            <p className="text-lg text-mutedText">"I traded a 2-hour coding session for a professional logo design. CreditSwap changed how I work."</p>
            <div className="mt-8 flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-primary font-bold">JD</div>
               <div>
                  <div className="font-bold text-slateText">John Doe</div>
                  <div className="text-sm text-mutedText">Full Stack Dev</div>
               </div>
            </div>
         </div>
      </div>

      {/* Right: Form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
           <h1 className="text-3xl font-bold font-heading mb-2">Create Account</h1>
           <p className="text-mutedText mb-8">Start with <span className="text-primary font-bold">50 Free Credits</span> today.</p>

           <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                 <User className="absolute left-4 top-3.5 text-slate-400" size={20}/>
                 <input name="username" placeholder="Username" onChange={(e) => setForm({...form, username: e.target.value})} className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" required/>
              </div>
              <div className="relative">
                 <Mail className="absolute left-4 top-3.5 text-slate-400" size={20}/>
                 <input name="email" type="email" placeholder="Email" onChange={(e) => setForm({...form, email: e.target.value})} className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" required/>
              </div>
              <div className="relative">
                 <Lock className="absolute left-4 top-3.5 text-slate-400" size={20}/>
                 <input name="password" type="password" placeholder="Password" onChange={(e) => setForm({...form, password: e.target.value})} className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" required/>
              </div>

              {error && <div className="p-3 bg-red-50 text-danger text-sm rounded-lg text-center">{error}</div>}

              <button disabled={loading} className="w-full py-3 bg-primary hover:bg-primaryHover text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/25 flex justify-center items-center gap-2">
                 {loading ? <Loader className="animate-spin" /> : "Sign Up"}
              </button>
           </form>

           <div className="mt-6 text-center text-sm text-mutedText">
              Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Log in</Link>
           </div>
        </motion.div>
      </div>
    </div>
  );
}
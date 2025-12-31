import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { Mail, Lock, Loader } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await loginUser(form);
      login(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Abstract Shapes */}
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-white">
        <div className="text-center mb-8">
           <h1 className="text-2xl font-bold font-heading text-slateText">Welcome Back</h1>
           <p className="text-mutedText">Continue your trading journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
           <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-400" size={20}/>
              <input name="email" placeholder="Email" onChange={(e) => setForm({...form, email: e.target.value})} className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" required/>
           </div>
           <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-400" size={20}/>
              <input name="password" type="password" placeholder="Password" onChange={(e) => setForm({...form, password: e.target.value})} className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" required/>
           </div>

           {error && <div className="p-3 bg-red-50 text-danger text-sm rounded-lg text-center">{error}</div>}

           <button disabled={loading} className="w-full py-3 bg-primary hover:bg-primaryHover text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/25 flex justify-center items-center gap-2">
              {loading ? <Loader className="animate-spin" /> : "Log In"}
           </button>
        </form>

        <div className="mt-6 text-center text-sm text-mutedText">
           New here? <Link to="/signup" className="text-primary font-bold hover:underline">Create Account</Link>
        </div>
      </motion.div>
    </div>
  );
}
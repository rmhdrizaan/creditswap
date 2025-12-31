import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createListing } from "../services/listingService";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, Briefcase } from "lucide-react";

export default function PostJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "Development",
    credits: 50,
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createListing(form);
      navigate("/marketplace"); // Redirect to feed after posting
    } catch (error) {
      alert("Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-background flex justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-soft border border-border overflow-hidden"
      >
        <div className="p-8 border-b border-border bg-slate-50 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-border">
            <ArrowLeft size={20} className="text-mutedText"/>
          </button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-slateText">Post a New Request</h1>
            <p className="text-sm text-mutedText">What do you need help with?</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-slateText mb-2">Job Title</label>
            <input 
              type="text" 
              placeholder="e.g., Fix responsive issue on Navbar" 
              className="w-full p-4 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              value={form.title}
              onChange={(e) => setForm({...form, title: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-slateText mb-2">Category</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-4 text-slate-400" size={18} />
                <select 
                  className="w-full pl-12 pr-4 p-4 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none bg-white"
                  value={form.category}
                  onChange={(e) => setForm({...form, category: e.target.value})}
                >
                  <option>Development</option>
                  <option>Design</option>
                  <option>Marketing</option>
                  <option>Writing</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            {/* Credits Budget */}
            <div>
              <label className="block text-sm font-bold text-slateText mb-2">Offer Credits</label>
              <div className="relative">
                <Zap className="absolute left-4 top-4 text-secondary" size={18} fill="currentColor" />
                <input 
                  type="number" 
                  min="1"
                  className="w-full pl-12 pr-4 p-4 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  value={form.credits}
                  onChange={(e) => setForm({...form, credits: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-slateText mb-2">Description</label>
            <textarea 
              rows="6"
              placeholder="Describe the task in detail..." 
              className="w-full p-4 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              required
            />
          </div>

          {/* Action */}
          <div className="pt-4 flex items-center justify-end gap-4">
             <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
             <button 
               disabled={loading}
               className="px-8 py-3 bg-primary hover:bg-primaryHover text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-70"
             >
               {loading ? "Posting..." : "Post Request"}
             </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
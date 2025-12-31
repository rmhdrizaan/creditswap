import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createListing } from "../services/listingService";
import { ArrowLeft, Zap } from "lucide-react";

export default function PostJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "Development", credits: 50 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createListing(form);
      navigate("/marketplace");
    } catch (error) {
      alert("Failed to post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen bg-slate-50 flex justify-center">
       <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"><ArrowLeft size={18}/> Cancel</button>
          
          <h1 className="text-3xl font-heading font-bold text-slate-900 mb-2">Post a Request</h1>
          <p className="text-slate-500 mb-8">Describe what you need done. Be specific.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
             <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                <input required className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" placeholder="e.g. Need a React Developer" value={form.title} onChange={e => setForm({...form, title: e.target.value})}/>
             </div>
             
             <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                   <select className="w-full p-4 rounded-xl border border-slate-200 outline-none bg-white" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                      {["Development", "Design", "Marketing", "Writing", "Other"].map(c => <option key={c}>{c}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Credits Budget</label>
                   <div className="relative">
                      <Zap size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 fill-indigo-500"/>
                      <input type="number" min="1" required className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" value={form.credits} onChange={e => setForm({...form, credits: e.target.value})}/>
                   </div>
                </div>
             </div>

             <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                <textarea required rows="5" className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 resize-none" placeholder="Provide full details..." value={form.description} onChange={e => setForm({...form, description: e.target.value})}/>
             </div>

             <button disabled={loading} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all">
                {loading ? "Posting..." : "Publish Job"}
             </button>
          </form>
       </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserProfile, updateUserProfile } from "../../services/userService";
import { User, Save, ArrowLeft, Briefcase, Code } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    bio: "",
    skills: "", // Comma separated string for input
  });

  useEffect(() => {
    if (user?._id) {
      getUserProfile(user._id).then((data) => {
        setForm({
          bio: data.bio || "",
          skills: data.skills ? data.skills.join(", ") : "",
        });
        setLoading(false);
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Convert comma string back to array
      const skillsArray = form.skills.split(",").map(s => s.trim()).filter(s => s);
      
      await updateUserProfile({
        bio: form.bio,
        skills: skillsArray
      });
      
      alert("Profile updated successfully!");
      navigate("/profile");
    } catch (error) {
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="pt-32 text-center">Loading settings...</div>;

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen bg-slate-50 flex justify-center">
      <div className="w-full max-w-2xl">
        <button onClick={() => navigate("/profile")} className="flex items-center gap-2 mb-6 text-slate-500 hover:text-slate-900 transition-colors">
           <ArrowLeft size={18} /> Back to Profile
        </button>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 p-8 text-white">
            <h1 className="text-2xl font-bold font-heading flex items-center gap-3">
              <User /> Edit Profile
            </h1>
            <p className="text-slate-400 mt-2">Update your professional identity and skills.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            {/* Username (Read Only) */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
              <input 
                disabled 
                value={user?.username || ""} 
                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Briefcase size={16} className="text-indigo-600"/> Professional Bio
              </label>
              <textarea 
                rows="4" 
                className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                placeholder="Tell the community about your expertise (e.g. 'Full Stack Developer with 5 years experience...')"
                value={form.bio}
                onChange={(e) => setForm({...form, bio: e.target.value})}
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Code size={16} className="text-indigo-600"/> Skills
              </label>
              <input 
                type="text"
                className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                placeholder="e.g. React, Node.js, Graphic Design (Separate with commas)"
                value={form.skills}
                onChange={(e) => setForm({...form, skills: e.target.value})}
              />
              <p className="text-xs text-slate-400 mt-2">These will appear on your public profile tags.</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button 
                type="submit" 
                disabled={saving}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save Changes"} <Save size={18}/>
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
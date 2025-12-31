import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserProfile } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { User, MapPin, Calendar, Star, Briefcase, Zap } from "lucide-react";

export default function Profile() {
  const { id } = useParams(); // Get ID from URL
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  
  // Use the ID from params, OR default to current user
  const targetId = id || currentUser?._id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if(targetId) {
          const data = await getUserProfile(targetId);
          setProfile(data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchProfile();
  }, [targetId]);

  if (!profile) return <div className="pt-32 text-center">Loading Profile...</div>;

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
         
         {/* Left: Main Info */}
         <motion.div 
           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
           className="md:col-span-2 space-y-6"
         >
            <div className="bg-white rounded-3xl border border-border shadow-soft overflow-hidden">
               <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
               <div className="px-8 pb-8">
                  <div className="-mt-12 mb-4">
                     <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg inline-block">
                        <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center text-3xl font-bold text-slate-500">
                           {profile.username.charAt(0).toUpperCase()}
                        </div>
                     </div>
                  </div>

                  <h1 className="text-3xl font-bold font-heading text-slateText">{profile.username}</h1>
                  <p className="text-mutedText mb-4">{profile.bio || "Digital Creator & Skill Trader"}</p>

                  <div className="flex gap-4 text-sm text-slate-500 border-t border-slate-100 pt-4">
                     <div className="flex items-center gap-1"><MapPin size={16}/> Earth</div>
                     <div className="flex items-center gap-1"><Calendar size={16}/> Joined {new Date(profile.createdAt).getFullYear()}</div>
                  </div>
               </div>
            </div>

            {/* LinkedIn Style: Current Activity */}
            <div className="bg-white rounded-3xl border border-border shadow-soft p-8">
               <h3 className="text-xl font-bold font-heading mb-6 flex items-center gap-2">
                  <Briefcase size={20} className="text-primary"/> Currently Working On
               </h3>
               
               {profile.activeJobs?.length > 0 ? (
                  <div className="space-y-4">
                     {profile.activeJobs.map(job => (
                        <div key={job._id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                           <span className="font-bold text-slate-700">{job.title}</span>
                           <span className="text-sm font-bold text-primary flex items-center gap-1">
                              <Zap size={14} fill="currentColor"/> {job.credits}
                           </span>
                        </div>
                     ))}
                  </div>
               ) : (
                  <p className="text-mutedText italic">Not currently assigned to any public jobs.</p>
               )}
            </div>
         </motion.div>

         {/* Right: Stats */}
         <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-border shadow-soft">
               <h3 className="font-bold text-slateText mb-4">Reputation</h3>
               <div className="flex items-center gap-2 text-yellow-500 text-xl font-bold mb-2">
                  <Star fill="currentColor" /> 5.0
               </div>
               <p className="text-sm text-mutedText">Based on {profile.completedJobsCount} completed swaps</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-border shadow-soft">
               <h3 className="font-bold text-slateText mb-4">Total Earnings</h3>
               <div className="text-3xl font-bold text-slateText flex items-center gap-2">
                  <Zap size={28} className="text-secondary fill-secondary"/> {profile.earnings}
               </div>
               <p className="text-sm text-mutedText mt-1">Lifetime credits earned</p>
            </div>
         </div>

      </div>
    </div>
  );
}
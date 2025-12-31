import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom"; // Added Link
import { getUserProfile } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import { Zap, Star, MapPin, Calendar, Briefcase, Edit, Code } from "lucide-react"; // Added Edit, Code

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  
  // Determine if this is "My Profile"
  const isOwnProfile = !id || id === currentUser?._id;
  const targetId = id || currentUser?._id;

  useEffect(() => {
    if(targetId) getUserProfile(targetId).then(setProfile).catch(console.error);
  }, [targetId]);

  if (!profile) return <div className="pt-32 text-center">Loading...</div>;

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen bg-slate-50 flex justify-center">
       <div className="w-full max-w-4xl">
          
          {/* Cover & Header */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6 relative">
             <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
             
             {/* Edit Button (Only for owner) */}
             {isOwnProfile && (
               <Link to="/settings" className="absolute top-4 right-4 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
                 <Edit size={16}/> Edit Profile
               </Link>
             )}

             <div className="px-8 pb-8 relative">
                <div className="-mt-12 mb-4 w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                   <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center text-3xl font-bold text-slate-500 uppercase">
                      {profile.username[0]}
                   </div>
                </div>
                
                <h1 className="text-3xl font-bold text-slate-900">{profile.username}</h1>
                
                {/* Bio Section */}
                <p className="text-slate-600 mt-2 max-w-2xl leading-relaxed">
                  {profile.bio || "No bio added yet. Used the settings to add your professional summary."}
                </p>

                {/* Skills Tags */}
                {profile.skills && profile.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {profile.skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100 flex items-center gap-1">
                        <Code size={12}/> {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-6 text-sm text-slate-500 border-t border-slate-100 pt-6 mt-6">
                   <span className="flex items-center gap-2"><MapPin size={16}/> Global</span>
                   <span className="flex items-center gap-2"><Calendar size={16}/> Joined {new Date(profile.createdAt).getFullYear()}</span>
                </div>
             </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
             {/* Active Jobs */}
             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-full">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Briefcase size={20} className="text-indigo-600"/> Active Jobs</h3>
                {profile.activeJobs?.length > 0 ? (
                   <div className="space-y-3">
                      {profile.activeJobs.map(j => (
                         <div key={j._id} className="p-3 bg-slate-50 rounded-xl flex justify-between font-medium text-sm border border-slate-100">
                            <span className="text-slate-700">{j.title}</span>
                            <span className="font-bold text-indigo-600">{j.credits} CR</span>
                         </div>
                      ))}
                   </div>
                ) : <p className="text-slate-400 text-sm italic">No active public jobs.</p>}
             </div>

             {/* Stats */}
             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-full">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Zap size={20} className="text-yellow-500 fill-yellow-500"/> Performance</h3>
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-50">
                   <span className="text-slate-500">Completed Jobs</span>
                   <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">{profile.completedJobsCount}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-slate-500">Total Earned</span>
                   <span className="font-bold text-slate-900 flex items-center gap-1 text-xl"><Zap size={18} className="text-indigo-500 fill-indigo-500"/> {profile.earnings}</span>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
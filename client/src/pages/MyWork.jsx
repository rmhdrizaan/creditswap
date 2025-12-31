import { useEffect, useState } from "react";
import { getAssignedListings } from "../services/listingService";
import { motion } from "framer-motion";
import { Clock, Zap, User, CheckCircle, Briefcase } from "lucide-react";

export default function MyWork() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAssignedListings().then(setWorks).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-heading font-bold mb-8 text-slate-900">My Jobs</h1>

        {loading ? <p>Loading...</p> : works.length === 0 ? (
           <div className="p-10 border border-dashed border-slate-300 rounded-2xl text-center bg-white">
             <Briefcase className="mx-auto text-slate-300 mb-2" size={40} />
             <p className="text-slate-500 font-medium">No active jobs.</p>
             <p className="text-sm text-slate-400">Apply to listings in the Marketplace to start earning.</p>
           </div>
        ) : (
          <div className="grid gap-6">
            {works.map((job) => (
              <motion.div 
                key={job._id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4"
              >
                <div>
                   <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${job.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {job.status === 'in-progress' ? 'In Progress' : 'Completed'}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={12}/> Updated {new Date(job.updatedAt).toLocaleDateString()}</span>
                   </div>
                   <h2 className="text-xl font-bold text-slate-900">{job.title}</h2>
                   <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                      <User size={14} /> Client: <span className="font-bold text-slate-700">@{job.user.username}</span>
                   </div>
                </div>

                <div className="text-right">
                   <div className="text-2xl font-bold text-indigo-600 flex items-center justify-end gap-1"><Zap size={20} fill="currentColor"/> {job.credits}</div>
                   {job.status === 'completed' && <span className="text-xs font-bold text-green-600 flex items-center justify-end gap-1"><CheckCircle size={12}/> Paid</span>}
                   {job.status === 'in-progress' && <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">Pending Completion</span>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
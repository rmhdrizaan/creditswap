import { useEffect, useState } from "react";
import { getAssignedListings } from "../services/listingService";
import { motion } from "framer-motion";
import { Briefcase, CheckCircle, Clock, Zap, User } from "lucide-react";

export default function MyWork() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWork = async () => {
      try {
        const data = await getAssignedListings();
        setWorks(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchWork();
  }, []);

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen bg-background">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-heading font-bold mb-8 text-slateText">My Active Jobs</h1>

        {loading ? (
          <p>Loading...</p>
        ) : works.length === 0 ? (
           <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center">
             <Briefcase size={48} className="mx-auto text-slate-300 mb-4" />
             <h3 className="text-xl font-bold text-slate-500">No active jobs</h3>
             <p className="text-mutedText mt-2">Apply to jobs in the Marketplace to start earning.</p>
           </div>
        ) : (
          <div className="grid gap-6">
            {works.map((job) => (
              <motion.div 
                key={job._id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-2xl border border-border shadow-soft flex flex-col md:flex-row justify-between gap-6"
              >
                <div>
                   <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                        job.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {job.status === 'in-progress' ? 'Active' : 'Completed'}
                      </span>
                      <span className="text-xs text-mutedText flex items-center gap-1">
                        <Clock size={12}/> Started {new Date(job.updatedAt).toLocaleDateString()}
                      </span>
                   </div>
                   <h2 className="text-xl font-bold text-slateText mb-2">{job.title}</h2>
                   <div className="flex items-center gap-2 text-sm text-slate-500">
                      <User size={14} /> Client: <span className="font-bold">@{job.user.username}</span>
                   </div>
                </div>

                <div className="flex flex-col items-end justify-center gap-2">
                   <div className="text-2xl font-bold font-heading text-primary flex items-center gap-1">
                      <Zap size={20} fill="currentColor"/> {job.credits}
                   </div>
                   {job.status === 'in-progress' ? (
                      <p className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">Work in Progress</p>
                   ) : (
                      <p className="text-xs text-green-600 font-bold flex items-center gap-1">
                        <CheckCircle size={12}/> Paid
                      </p>
                   )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
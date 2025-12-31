import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyListings } from "../services/listingService";
import {
  Zap,
  Settings,
  Plus,
  CheckCircle,
  Clock,
  User,
} from "lucide-react";
import { motion } from "framer-motion";

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyListings()
      .then(setListings)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-slate-900">
            My Listings
          </h1>
          <Link
            to="/post-job"
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md hover:-translate-y-0.5"
          >
            <Plus size={18} /> New Post
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <p className="text-center py-10 text-slate-400">
            Loading your jobs...
          </p>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-500 font-medium">
              You haven't posted any jobs yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6"
              >
                {/* Left: Job Info */}
                <div className="flex-1 w-full md:w-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.status === "open"
                          ? "bg-green-100 text-green-700"
                          : item.status === "in-progress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {item.title}
                  </h3>
                </div>

                {/* Right: Worker Info & Actions */}
                <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-50 pt-4 md:pt-0">
                  {/* Credits */}
                  <span className="font-bold text-slate-900 flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <Zap
                      size={16}
                      className="text-indigo-500 fill-indigo-500"
                    />
                    {item.credits}
                  </span>

                  {/* Status-based Actions */}
                  {item.status === "completed" ? (
                    /* COMPLETED */
                    <div className="flex items-center gap-3 px-4 py-2 bg-green-50 text-green-700 rounded-xl border border-green-100">
                      <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-xs font-bold text-green-800">
                        {item.hiredWorker?.username?.[0] || (
                          <User size={14} />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase">
                          Completed by
                        </span>
                        <span className="text-sm font-bold">
                          @{item.hiredWorker?.username || "Unknown"}
                        </span>
                      </div>
                      <CheckCircle size={20} />
                    </div>
                  ) : item.status === "in-progress" ? (
                    /* IN PROGRESS */
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden md:block">
                        <span className="text-xs text-slate-400 block">
                          Hired Worker
                        </span>
                        <span className="text-sm font-bold text-slate-700">
                          @{item.hiredWorker?.username}
                        </span>
                      </div>
                      <Link to={`/my-listings/${item._id}/manage`}>
                        <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2">
                          <Settings size={16} /> Actions
                        </button>
                      </Link>
                    </div>
                  ) : (
                    /* OPEN */
                    <Link to={`/my-listings/${item._id}/manage`}>
                      <button className="px-5 py-2 border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 text-slate-600 font-bold rounded-xl transition-colors flex items-center gap-2">
                        <Settings size={16} /> Manage
                      </button>
                    </Link>
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

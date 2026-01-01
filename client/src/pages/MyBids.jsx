import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOffers } from "../services/offerService";

import {
  FileText,
  Clock,
  Zap,
  CheckCircle,
  
  XCircle,
  AlertCircle
} from "lucide-react";

export default function MyBids() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    getMyOffers().then(setBids).finally(() => setLoading(false));
  }, []);


  // Group bids by status
  const activeBids = bids.filter(b => b.status === "pending" || b.status === "accepted");
  const rejectedBids = bids.filter(b => b.status === "rejected");

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-heading font-bold text-slate-900 mb-8 flex items-center gap-3">
          <FileText className="text-indigo-600" /> My Applications
        </h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : bids.length === 0 ? (
          <div className="p-12 bg-white rounded-3xl border border-dashed border-slate-200 text-center text-slate-400">
            <FileText size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-lg">No applications yet.</p>
            <p className="text-sm mt-1">Browse the marketplace to find jobs.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Bids */}
            {activeBids.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Active Applications</h2>
                <div className="space-y-4">
                  {activeBids.map((bid) => (
                    <div
                      key={bid._id}
                      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">
                            {bid.listing.title}
                          </h3>
                          <p className="text-sm text-slate-500">
                            Client: @{bid.listing.user?.username}
                          </p>
                        </div>

                        <div className="flex flex-col items-end">
                          <span className="font-bold text-indigo-600 flex items-center gap-1">
                            <Zap size={16} fill="currentColor" />
                            {bid.listing.credits}
                          </span>
                          <span
                            className={`text-xs font-bold uppercase mt-1 px-2 py-1 rounded ${
                              bid.status === "accepted"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {bid.status === "accepted" ? "HIRED" : "PENDING"}
                          </span>
                        </div>
                      </div>

                      

                      {/* Footer Actions */}
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock size={12} /> Applied{" "}
                          {new Date(bid.createdAt).toLocaleDateString()}
                        </span>

                        <div className="flex items-center gap-4">
                          
                          

                          {/* STATUS ACTIONS */}
                          {bid.status === "pending" && (
                            <Link
                              to={`/services/${bid.listing._id}`}
                              className="text-sm font-bold text-indigo-600 hover:underline"
                            >
                              Edit Bid
                            </Link>
                          )}

                          {bid.status === "accepted" && (
                            <Link
                              to="/my-work"
                              className="text-sm font-bold text-green-600 flex items-center gap-1"
                            >
                              <CheckCircle size={14} /> View Active Job
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rejected Bids */}
            {rejectedBids.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <XCircle size={20} className="text-red-500" />
                  Not Selected
                </h2>
                <div className="space-y-3">
                  {rejectedBids.map((bid) => (
                    <div
                      key={bid._id}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-slate-700">
                            {bid.listing.title}
                          </h4>
                          <p className="text-sm text-slate-500">
                            Client: @{bid.listing.user?.username}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-500 font-medium flex items-center gap-1">
                            <AlertCircle size={12} /> Not Selected
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
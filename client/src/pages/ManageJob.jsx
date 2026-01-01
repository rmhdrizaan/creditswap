import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getListing, completeListing } from "../services/listingService";
import { getListingOffers, acceptOffer } from "../services/offerService";

import {
  ArrowLeft,
  CheckCircle,
  Zap,
  User,
  Clock,
  Briefcase,
  X
} from "lucide-react";
import { motion } from "framer-motion";

export default function ManageJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  

  const [listing, setListing] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hiring, setHiring] = useState(null);

  // Fetch data
  const fetchData = async () => {
    try {
      const [lData, oData] = await Promise.all([
        getListing(id),
        getListingOffers(id),
      ]);
      setListing(lData);
      setOffers(oData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Handle hiring a worker
  const handleHire = async (offer, workerId) => {
    if (!offer?._id || !workerId) return;
    
    setHiring(offer._id);
    try {
      await acceptOffer(offer._id);
      
      // Update local state to reflect the change
      setOffers(prevOffers => 
        prevOffers.map(o => {
          if (o._id === offer._id) {
            return { ...o, status: "accepted" };
          }
          // Reject other pending offers when one is accepted
          if (o.status === "pending" && o._id !== offer._id) {
            return { ...o, status: "rejected" };
          }
          return o;
        })
      );
      
      // Update listing status to in-progress
      setListing(prev => prev ? { ...prev, status: "in-progress" } : null);
      
    } catch (error) {
      console.error("Error accepting offer:", error);
      alert("Failed to hire worker. Please try again.");
    } finally {
      setHiring(null);
    }
  };

  // Handle completing the job
  const handleComplete = async () => {
    if (!listing || !window.confirm("Are you sure you want to complete this job and release payment?")) return;
    
    try {
      await completeListing(id);
      // Update listing status
      setListing(prev => prev ? { ...prev, status: "completed" } : null);
      alert("Job completed successfully!");
    } catch (error) {
      console.error("Error completing job:", error);
      alert("Failed to complete job. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="pt-32 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-2 text-slate-600">Loading job details...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="pt-32 text-center">
        <p className="text-red-600">Job not found</p>
        <button
          onClick={() => navigate("/my-listings")}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Back to Listings
        </button>
      </div>
    );
  }

  // Group offers by status
  const pendingOffers = offers.filter(o => o.status === "pending");
  const acceptedOffers = offers.filter(o => o.status === "accepted");
  const rejectedOffers = offers.filter(o => o.status === "rejected");

  return (
    <div className="pt-28 pb-20 px-4 md:px-6 min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate("/my-listings")}
          className="flex items-center gap-2 mb-8 text-slate-600 hover:text-slate-900 transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to My Listings
        </button>

        {/* Job header card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                {listing.title}
              </h1>
              <p className="text-slate-600 mb-4">{listing.description}</p>
              
              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase ${
                  listing.status === "open"
                    ? "bg-green-100 text-green-700"
                    : listing.status === "in-progress"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-600"
                }`}>
                  {listing.status.replace("-", " ")}
                </span>
                
                <span className="font-bold text-indigo-600 flex items-center gap-2">
                  <Zap size={16} fill="currentColor" />
                  {listing.credits} Credits
                </span>
                
                <span className="text-slate-500 text-sm flex items-center gap-1">
                  <Clock size={14} />
                  Posted {new Date(listing.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {listing.status === "in-progress" && (
              <button
                onClick={handleComplete}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 flex items-center gap-2 transition-all transform hover:scale-[1.02]"
              >
                <CheckCircle size={20} />
                Complete & Pay
              </button>
            )}
          </div>
        </div>

        {/* Applications section with tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">
              Applications ({offers.length})
            </h2>
            
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                {pendingOffers.length} Pending
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                {acceptedOffers.length} Hired
              </span>
              <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                {rejectedOffers.length} Not Selected
              </span>
            </div>
          </div>

          {offers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-400 text-lg">No applications yet</p>
              <p className="text-slate-500 text-sm mt-1">Share your job listing to get more applicants</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Hired Worker */}
              {acceptedOffers.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-500" />
                    Hired Worker
                  </h3>
                  {acceptedOffers.map((offer) => (
                    <motion.div
                      key={offer._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 rounded-xl border-2 border-green-200 bg-green-50"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center font-bold text-green-600 text-xl border-2 border-white">
                          {offer.worker?.username?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-slate-900 text-lg">
                              @{offer.worker?.username}
                            </h3>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">
                              ✓ HIRED
                            </span>
                          </div>
                          <p className="text-slate-600 italic">
                            "{offer.message}"
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Pending Applications */}
              {pendingOffers.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-yellow-500" />
                    Pending Applications ({pendingOffers.length})
                  </h3>
                  <div className="space-y-4">
                    {pendingOffers.map((offer) => (
                      <motion.div
                        key={offer._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center font-bold text-indigo-600 text-xl">
                              {offer.worker?.username?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-lg">
                                @{offer.worker?.username}
                              </h3>
                              {offer.worker?.skills?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {offer.worker.skills.slice(0, 3).map((skill, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <p className="text-slate-600 italic mt-3">
                                "{offer.message}"
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Hire button */}
                            <button
                              onClick={() => handleHire(offer, offer.worker?._id)}
                              disabled={hiring === offer._id}
                              className="px-5 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {hiring === offer._id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  Hiring...
                                </>
                              ) : (
                                <>
                                  <Briefcase size={18} />
                                  Hire Now
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Not Selected */}
              {rejectedOffers.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <X size={20} className="text-red-500" />
                    Not Selected ({rejectedOffers.length})
                  </h3>
                  <div className="space-y-4">
                    {rejectedOffers.map((offer) => (
                      <motion.div
                        key={offer._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-xl border border-slate-100 bg-slate-50"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-lg">
                            {offer.worker?.username?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-700">
                              @{offer.worker?.username}
                            </h3>
                            <p className="text-slate-500 text-sm italic mt-1">
                              "{offer.message}"
                            </p>
                            <p className="text-red-500 text-xs font-medium mt-2 flex items-center gap-1">
                              <X size={12} /> Job assigned to another applicant
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getListing, completeListing } from "../services/listingService";
import { getListingOffers, acceptOffer } from "../services/offerService";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, MessageSquare, Shield } from "lucide-react";

export default function ManageJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [lData, oData] = await Promise.all([
        getListing(id),
        getListingOffers(id),
      ]);
      setListing(lData);
      setOffers(oData);
    } catch (error) {
      console.error(error);
      alert("Failed to load job data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAccept = async (offerId) => {
    if (!confirm("Accept this worker? This will reject other applicants.")) return;
    try {
      await acceptOffer(offerId);
      alert("Worker accepted!");
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Error accepting offer");
    }
  };

  const handleComplete = async () => {
    if (!confirm("Confirm job completion? This will send credits to the worker.")) return;
    try {
      await completeListing(id);
      alert("Success! Credits transferred.");
      navigate("/my-listings"); // ✅ Correct redirect
    } catch (error) {
      alert(error.response?.data?.message || "Transaction failed");
    }
  };

  if (loading) return <div className="pt-32 text-center">Loading...</div>;

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-4xl">
        <button
          onClick={() => navigate("/my-listings")}
          className="flex items-center gap-2 mb-6 text-mutedText hover:text-slateText"
        >
          <ArrowLeft size={18} /> Back to My Listings
        </button>

        {/* Job Header */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold font-heading">{listing.title}</h1>
            <span
              className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                listing.status === "open"
                  ? "bg-green-100 text-green-700"
                  : listing.status === "in-progress"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              Status: {listing.status}
            </span>
          </div>

          {listing.status === "in-progress" && (
            <button
              onClick={handleComplete}
              className="px-6 py-3 bg-secondary hover:bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all flex items-center gap-2"
            >
              <CheckCircle size={20} /> Mark as Complete
            </button>
          )}
        </div>

        {/* Applicants */}
        <h2 className="text-xl font-bold font-heading mb-4">
          Applicants ({offers.length})
        </h2>

        {offers.length === 0 ? (
          <div className="p-8 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center text-slate-500">
            No one has applied yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {offers.map((offer) => (
              <motion.div
                key={offer._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-2xl border ${
                  offer.status === "accepted"
                    ? "bg-blue-50 border-blue-200"
                    : "bg-white border-border"
                } shadow-sm`}
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                      {offer.worker.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slateText">
                        @{offer.worker.username}
                      </h3>
                      <p className="text-sm text-mutedText flex items-center gap-1">
                        <Shield size={12} /> {offer.worker.credits} Credits Reputation
                      </p>
                      <div className="mt-2 p-3 bg-slate-50 rounded-lg text-sm text-slate-700 italic border border-slate-100 flex gap-2">
                        <MessageSquare
                          size={16}
                          className="text-slate-400 shrink-0 mt-0.5"
                        />
                        "{offer.message}"
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    {listing.status === "open" &&
                      offer.status === "pending" && (
                        <button
                          onClick={() => handleAccept(offer._id)}
                          className="px-5 py-2 bg-slateText text-white font-bold rounded-xl hover:bg-slate-700 transition-colors shadow-lg"
                        >
                          Accept
                        </button>
                      )}
                    {offer.status === "accepted" && (
                      <span className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-xl flex items-center gap-2">
                        <CheckCircle size={16} /> Hired
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getListing } from "../services/listingService";
import { createOffer, getMyOffers, updateOffer } from "../services/offerService";
import { ArrowLeft, Zap, Shield, Send, Edit2 } from "lucide-react";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Track existing bid state
  const [existingBid, setExistingBid] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const listData = await getListing(id);
        setListing(listData);
        
        // Check if I already bid
        const myOffers = await getMyOffers();
        const bid = myOffers.find(o => o.listing._id === id);
        if(bid) {
          setExistingBid(bid);
          setMessage(bid.message);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if(existingBid) {
        await updateOffer(id, message);
        alert("Bid updated!");
      } else {
        await createOffer(id, message);
        alert("Application sent!");
      }
      navigate("/my-bids");
    } catch (error) {
      alert(error.response?.data?.message || "Action failed");
    }
  };

  if (loading) return <div className="pt-32 text-center">Loading...</div>;

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen bg-slate-50 flex justify-center">
       <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
             <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-medium"><ArrowLeft size={18}/> Back</button>
             
             <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm mb-6">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wide mb-4 inline-block">{listing.category}</span>
                <h1 className="text-3xl font-heading font-bold text-slate-900 mb-6">{listing.title}</h1>
                <p className="whitespace-pre-line text-slate-600">{listing.description}</p>
             </div>

             {/* Dynamic Form Area */}
             {listing.status === 'open' && (
                <div className={`p-8 rounded-3xl border shadow-sm ${existingBid ? "bg-indigo-50 border-indigo-100" : "bg-white border-slate-100"}`}>
                   <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                     {existingBid ? <><Edit2 size={18}/> Edit your application</> : "Apply for this job"}
                   </h3>
                   <textarea 
                     className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none mb-4 bg-white"
                     rows="4"
                     placeholder="Why are you a good fit?"
                     value={message}
                     onChange={e => setMessage(e.target.value)}
                   />
                   <button onClick={handleSubmit} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all">
                      {existingBid ? "Update Application" : "Send Application"} <Send size={16}/>
                   </button>
                </div>
             )}
          </div>
          
          {/* Sidebar */}
          <div>
             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
                <p className="text-slate-500 text-sm font-medium mb-2">Budget</p>
                <div className="text-4xl font-bold text-slate-900 flex items-center justify-center gap-2 mb-4"><Zap size={32} className="text-indigo-500 fill-indigo-500"/> {listing.credits}</div>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                   <Shield size={16} className="text-green-500"/> Verified Client
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
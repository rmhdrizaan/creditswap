import { Link } from "react-router-dom";
import { Zap, Heart, Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
                <Zap size={16} fill="currentColor" />
              </div>
              <span className="text-xl font-bold font-heading text-slate-900">CreditSwap</span>
            </div>
            <p className="text-slate-500 leading-relaxed max-w-sm">
              Built to respect time, skills, and humanity. We are creating a decentralized economy where value is determined by effort, not currency.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/about" className="hover:text-indigo-600">About Us</Link></li>
              <li><Link to="/marketplace" className="hover:text-indigo-600">Browse Jobs</Link></li>
              <li><Link to="/signup" className="hover:text-indigo-600">Join the Movement</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4">Community</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><span className="flex items-center gap-2"><Shield size={14}/> Trust & Safety</span></li>
              <li><span className="flex items-center gap-2"><Heart size={14}/> Ethics Code</span></li>
              <li><a href="#" className="hover:text-indigo-600">Support</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} CreditSwap. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Code, PenTool, CheckCircle } from "lucide-react";

export default function Landing() {
  return (
    <div className="relative pt-32 pb-20 min-h-screen overflow-hidden flex flex-col items-center">
      
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-100/50 rounded-full blur-[120px] -z-10 animate-float" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-100/50 rounded-full blur-[120px] -z-10" />

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-6 text-center z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-white border border-indigo-100 text-primary text-xs font-bold uppercase tracking-wider shadow-sm mb-6">
            🚀 The #1 Skill Exchange Platform
          </span>
          
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-slateText leading-tight mb-6">
            Stop Spending Money. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Start Swapping Skills.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-mutedText max-w-2xl mx-auto mb-10 leading-relaxed">
            You write code. She designs logos. 
            Swap your talents directly using <span className="text-primary font-bold">Credits</span>. 
            No cash needed. Just pure value exchange.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="w-full sm:w-auto">
              <button className="w-full px-8 py-4 bg-primary hover:bg-primaryHover text-white font-bold rounded-xl shadow-xl shadow-primary/30 transition-all transform hover:-translate-y-1">
                Get 50 Free Credits
              </button>
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 bg-white border border-border text-slateText font-bold rounded-xl hover:bg-slate-50 transition-all">
              How it Works
            </button>
          </div>
        </motion.div>

        {/* Floating Cards Demo */}
        <motion.div 
           initial={{ opacity: 0, y: 40 }} 
           animate={{ opacity: 1, y: 0 }} 
           transition={{ delay: 0.3, duration: 0.8 }}
           className="mt-20 relative h-[300px] w-full max-w-3xl mx-auto hidden md:block"
        >
           {/* Card 1: User A */}
           <div className="absolute left-0 top-10 bg-white p-6 rounded-2xl shadow-card border border-border w-[280px] transform -rotate-6 z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><Code size={20}/></div>
                <div>
                  <h4 className="font-bold text-sm">Alex (Dev)</h4>
                  <p className="text-xs text-mutedText">Needs a Logo</p>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-blue-500"></div>
              </div>
           </div>

           {/* Swap Icon */}
           <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 bg-white p-4 rounded-full shadow-xl border border-border">
              <ArrowRight className="text-primary animate-pulse" />
           </div>

           {/* Card 2: User B */}
           <div className="absolute right-0 top-10 bg-white p-6 rounded-2xl shadow-card border border-border w-[280px] transform rotate-6 z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600"><PenTool size={20}/></div>
                <div>
                  <h4 className="font-bold text-sm">Sarah (Designer)</h4>
                  <p className="text-xs text-mutedText">Needs a Website</p>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-pink-500"></div>
              </div>
           </div>
        </motion.div>
      </div>
    </div>
  );
}
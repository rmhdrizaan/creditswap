import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Heart, Globe, TrendingUp, Search, PlusCircle, ArrowRight, ShieldCheck, Users } from "lucide-react";

export default function Home() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="bg-slate-50">
      
      {/* 1️⃣ HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-100/50 rounded-full blur-[120px] -z-10 animate-pulse" />
        
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white border border-slate-200 text-indigo-600 text-xs font-bold uppercase tracking-wider shadow-sm mb-6">
              ⏳ A New Economy of Time
            </span>
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-slate-900 leading-tight mb-6">
              A World Where Time Is <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Worth More Than Money.</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Earn credits by helping others. Spend credits to get help. <br/>
              No money. No inequality. Just pure value exchange.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/marketplace">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-xl shadow-indigo-500/20 flex items-center gap-2">
                  <Search size={20}/> Find Work
                </motion.button>
              </Link>
              <Link to="/post-job">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-8 py-4 bg-white text-slate-800 border border-slate-200 font-bold rounded-xl shadow-sm hover:bg-slate-50 flex items-center gap-2">
                  <PlusCircle size={20}/> Post a Job
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2️⃣ HOW IT WORKS */}
      <section className="py-20 px-6 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading font-bold text-slate-900">How the Time Economy Works</h2>
            <p className="text-slate-500 mt-2">Simple. Transparent. Fair.</p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
          >
            {[
              { icon: Search, title: "1. Find or Post", desc: "Browse tasks or request help from the community." },
              { icon: Users, title: "2. Exchange Skills", desc: "Connect with students and pros alike." },
              { icon: Clock, title: "3. Earn Credits", desc: "Your time is valued directly in credits." },
              { icon: Heart, title: "4. Get Help", desc: "Use earned credits to hire others." }
            ].map((step, i) => (
              <motion.div key={i} variants={fadeInUp} className="p-6 bg-slate-50 rounded-2xl text-center border border-slate-100 hover:shadow-md transition-all">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-sm border border-slate-100">
                  <step.icon size={24}/>
                </div>
                <h3 className="font-bold text-lg mb-2 text-slate-800">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3️⃣ SOCIAL IMPACT & BENCHMARK */}
      <section className="py-24 px-6 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <span className="text-indigo-400 font-bold uppercase tracking-wider text-xs mb-2 block">Social Benchmark</span>
            <h2 className="text-4xl font-heading font-bold mb-6 leading-tight">
              In a society obsessed with money, <br/>
              <span className="text-indigo-400">we value effort.</span>
            </h2>
            <div className="space-y-6 text-slate-300 text-lg">
              <p className="flex gap-4">
                <Globe className="shrink-0 text-indigo-500" />
                <span>Reduces dependency on currency, making help accessible to students and the unemployed.</span>
              </p>
              <p className="flex gap-4">
                <TrendingUp className="shrink-0 text-indigo-500" />
                <span>Helps you build a reputation based on skill, not your marketing budget.</span>
              </p>
              <p className="flex gap-4">
                <ShieldCheck className="shrink-0 text-indigo-500" />
                <span>Encourages community trust over cut-throat competition.</span>
              </p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10">
            <h3 className="font-bold text-xl mb-6">Why Choose This Platform?</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                <span>Traditional Gig Apps</span>
                <span className="text-red-400 font-medium">Money Focused</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-indigo-600 rounded-xl shadow-lg transform scale-105">
                <span className="font-bold">CreditSwap</span>
                <span className="text-white font-bold flex items-center gap-2"><Clock size={16}/> Time Focused</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                <span>Freelance Sites</span>
                <span className="text-red-400 font-medium">High Fees (20%)</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-indigo-600/50 rounded-xl border border-indigo-500/30">
                <span className="font-bold">CreditSwap</span>
                <span className="text-indigo-200 font-bold">Zero Fees</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4️⃣ LIVE ACTIVITY */}
      <section className="py-20 px-6 bg-indigo-50 border-t border-indigo-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-indigo-900 mb-8">Community Pulse</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <p className="text-4xl font-bold text-indigo-600 mb-1">1,200+</p>
              <p className="text-slate-500 text-sm font-medium">Hours Exchanged</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <p className="text-4xl font-bold text-indigo-600 mb-1">450</p>
              <p className="text-slate-500 text-sm font-medium">Skills Traded Today</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm col-span-2 md:col-span-1">
              <p className="text-4xl font-bold text-green-500 mb-1">98%</p>
              <p className="text-slate-500 text-sm font-medium">Job Success Rate</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
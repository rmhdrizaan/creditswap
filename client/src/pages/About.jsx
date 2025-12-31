import { motion } from "framer-motion";
import { Zap, Users, Shield, Globe } from "lucide-react";

const stats = [
  { label: "Active Users", value: "2,500+" },
  { label: "Swaps Completed", value: "14k" },
  { label: "Money Saved", value: "$500k+" },
];

export default function About() {
  return (
    <div className="pt-32 pb-20 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 text-center">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 text-slateText">
            We are killing the <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Billable Hour.</span>
          </h1>
          <p className="text-xl text-mutedText leading-relaxed mb-12">
            CreditSwap is a decentralized economy where value is determined by effort, not currency. 
            We believe that a hour of coding is worth a hour of design.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-soft border border-border"
            >
              <h3 className="text-4xl font-bold text-primary mb-2">{stat.value}</h3>
              <p className="text-mutedText font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Values */}
        <div className="text-left space-y-12">
          <h2 className="text-3xl font-heading font-bold text-center mb-10">Why we built this</h2>
          
          <div className="flex gap-6 items-start">
            <div className="p-3 bg-indigo-50 rounded-xl text-primary"><Users size={24}/></div>
            <div>
              <h3 className="text-xl font-bold mb-2">Community First</h3>
              <p className="text-mutedText">We are building for Solopreneurs who need help but want to save cash for growth.</p>
            </div>
          </div>
          
          <div className="flex gap-6 items-start">
            <div className="p-3 bg-emerald-50 rounded-xl text-secondary"><Zap size={24}/></div>
            <div>
              <h3 className="text-xl font-bold mb-2">Instant Value</h3>
              <p className="text-mutedText">No invoices. No bank transfers. Credits are transferred instantly upon job completion.</p>
            </div>
          </div>

           <div className="flex gap-6 items-start">
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><Globe size={24}/></div>
            <div>
              <h3 className="text-xl font-bold mb-2">Global Talent</h3>
              <p className="text-mutedText">Trade with anyone, anywhere. Skill has no borders and neither do Credits.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
import React from "react";
import { Shield, Brain, FileText, AlertTriangle } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/5 bg-[#0A0A0B] mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">

        {/* Brand Section */}
        <div className="space-y-4 col-span-2 md:col-span-1">
          <h2 className="text-xl font-bold text-white font-headline">
            MineRakshak
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            An AI-powered mining safety intelligence platform that analyzes DGMS accident records (2016–2022) using NLP to deliver predictive hazard detection, real-time alerts, and automated audit reports.
          </p>
        </div>

        {/* Platform Features */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
            Platform
          </h3>
          <ul className="space-y-3">
            {[
              { icon: Brain, label: "AI Chatbot" },
              { icon: AlertTriangle, label: "Risk Alerts" },
              { icon: FileText, label: "Audit Reports" },
              { icon: Shield, label: "Safety Analysis" }
            ].map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-sm text-slate-400">
                <item.icon size={14} className="text-slate-500" />
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Technology Stack */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
            Technology
          </h3>
          <ul className="space-y-3">
            {[
              "Natural Language Processing",
              "Gemini AI Integration",
              "DGMS Data Pipeline",
              "Real-time Monitoring"
            ].map((item) => (
              <li key={item} className="text-sm text-slate-400">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Data & Compliance */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
            Data Sources
          </h3>
          <ul className="space-y-3">
            {[
              "DGMS Accident Records",
              "Mining Safety Bulletins",
              "Incident Analysis Reports",
              "Compliance Standards"
            ].map((item) => (
              <li key={item} className="text-sm text-slate-400">
                {item}
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 py-6 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-slate-500 uppercase tracking-widest">
          © 2026 MineRakshak 
        </p>

        <p className="text-xs text-slate-600">
          Powered by AI for Mining Safety ⚡
        </p>
      </div>
    </footer>
  );
};
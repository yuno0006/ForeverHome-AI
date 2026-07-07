"use client";

import { motion } from "framer-motion";
import { Heart, Calendar, ShieldCheck, Star, AlertTriangle, TrendingUp, PawPrint } from "lucide-react";
import { calculateInsights } from "@/lib/insightsCalculator";
import CatsNeedingAttention from "@/components/insights/CatsNeedingAttention";
import CommonConcernsList from "@/components/insights/CommonConcernsList";

export default function ShelterInsightsPage() {
  const insights = calculateInsights();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-4xl sm:text-5xl font-black text-cocoa tracking-tight leading-none">Shelter Insights</h1>
        <p className="mt-3 text-base text-cocoa/60 font-medium max-w-xl leading-relaxed">
          Track adoptions, spot patterns, and know which cats need attention — at a glance.
        </p>
        <p className="mt-2 text-sm text-cocoa/40 font-bold uppercase tracking-wider">
          Demo data shown below. Connect Firestore to see live shelter metrics.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Active Adoptions",
            value: insights.activeAdoptions,
            icon: <Heart className="w-5 h-5 text-white" />,
            bg: "bg-heart",
          },
          {
            label: "Avg. Time to Adoption",
            value: `${insights.averageTimeToAdoption} days`,
            icon: <Calendar className="w-5 h-5 text-white" />,
            bg: "bg-lavender-deep",
          },
          {
            label: "High Concerns Reviewed",
            value: insights.highConcernsReviewed,
            icon: <ShieldCheck className="w-5 h-5 text-white" />,
            bg: "bg-sunny",
          },
          {
            label: "Adopter Satisfaction",
            value: `${insights.adopterSatisfaction} / 5.0`,
            icon: <Star className="w-5 h-5 text-white" />,
            bg: "bg-risk-low",
          },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className="bg-white rounded-[2rem] p-6 sm:p-8 border-2 border-cocoa/10 shadow-[6px_6px_0px_0px_rgba(42,29,20,0.05)] hover:shadow-[8px_8px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex flex-col gap-4">
              <div className={`w-14 h-14 rounded-[1rem] ${stat.bg} flex items-center justify-center shrink-0 shadow-inner`}>
                {stat.icon}
              </div>
              <div className="space-y-1">
                <p className="font-display text-4xl font-black text-cocoa leading-none">{stat.value}</p>
                <p className="text-sm font-bold text-cocoa/60">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail Panels */}
      <div className="grid lg:grid-cols-2 gap-8 mt-10">
        <div className="bg-white rounded-[2rem] p-8 border-2 border-cocoa/10 shadow-[6px_6px_0px_0px_rgba(42,29,20,0.05)]">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-[1rem] bg-coral/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-coral-deep" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-black text-cocoa leading-tight">Cats Needing Attention</h3>
              <p className="text-sm font-bold text-cocoa/50">Who to check in on today</p>
            </div>
          </div>
          <CatsNeedingAttention cats={insights.catsNeedingAttention} />
        </div>

        <div className="bg-white rounded-[2rem] p-8 border-2 border-cocoa/10 shadow-[6px_6px_0px_0px_rgba(42,29,20,0.05)]">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-[1rem] bg-sunny/20 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 text-sunny-deep" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-black text-cocoa leading-tight">Common Compatibility Concerns</h3>
              <p className="text-sm font-bold text-cocoa/50">Last 30 days — patterns to learn from</p>
            </div>
          </div>
          <CommonConcernsList concerns={insights.commonConcerns} />
        </div>
      </div>

      <div className="text-center mt-10">
        <div className="inline-flex items-center gap-2 bg-cat-dark/5 border border-sunny/20 rounded-full px-4 py-2">
          <PawPrint className="w-4 h-4 text-charcoal/40" />
          <span className="text-xs font-bold text-charcoal/40 uppercase tracking-widest">
            Data informs. Humans decide. Cats rule.
          </span>
        </div>
      </div>
    </div>
  );
}

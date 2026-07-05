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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cat-dark">Shelter Insights</h1>
        <p className="mt-1 text-charcoal/50">
          Track adoptions, spot patterns, and know which cats need attention — at a glance.
        </p>
        <p className="mt-2 text-xs text-charcoal/40">
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
            className="bg-white rounded-2xl p-5 border border-sunny/20 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-cat-dark">{stat.value}</p>
                <p className="text-xs text-charcoal/50">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail Panels */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-sunny/20 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-heart flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-cat-dark">Cats Needing Attention</h3>
              <p className="text-xs text-charcoal/50">Who to check in on today</p>
            </div>
          </div>
          <CatsNeedingAttention cats={insights.catsNeedingAttention} />
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sunny/20 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-sunny flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-cat-dark" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-cat-dark">Common Compatibility Concerns</h3>
              <p className="text-xs text-charcoal/50">Last 30 days — patterns to learn from</p>
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

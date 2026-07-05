"use client";

import { motion } from "framer-motion";
import { X, Check, Heart, Globe, Trophy, PawPrint } from "lucide-react";
import { StickerBadge, SectionTag } from "@/components/ui/CatElements";

export default function OutcomePage() {
  return (
    <div className="min-h-screen pb-24 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 space-y-4"
        >
          <SectionTag>The difference</SectionTag>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-cocoa tracking-tight">
            The ForeverHome{" "}
            <span className="text-gradient-warm italic">Difference</span>
          </h1>
          <p className="text-lg text-cocoa/60 font-medium max-w-2xl mx-auto leading-relaxed">
            Barnaby&apos;s story — an illustration of how structured assessment
            and post-adoption support can change outcomes.
          </p>
        </motion.div>

        {/* Side by Side */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Without ForeverHome */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[28px] p-7 border-2 border-risk-high/30 shadow-[5px_5px_0px_0px_#FEE2E2] relative"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-risk-high/10 flex items-center justify-center">
                <X className="w-5 h-5 text-risk-high" />
              </div>
              <h2 className="font-display text-xl font-black text-cocoa">
                Without ForeverHome
              </h2>
            </div>
            <div className="space-y-4">
              {[
                "Barnaby is adopted without a structured compatibility review",
                "The busy household overwhelms him",
                "His hiding is misunderstood as rejection",
                "Shelter has no visibility into his adjustment",
                "He is returned to the shelter",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <X className="h-4 w-4 text-risk-high mt-0.5 shrink-0" />
                  <p className={`text-sm text-cocoa/70 font-medium leading-relaxed ${i === 4 ? "text-risk-high font-bold" : ""}`}>
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* With ForeverHome */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[28px] p-7 border-2 border-sage/30 shadow-[5px_5px_0px_0px_rgba(42,29,20,1)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-sage/10 rounded-full blur-2xl" />
            <div className="flex items-center gap-3 mb-5 relative">
              <div className="w-10 h-10 rounded-xl bg-sage flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <h2 className="font-display text-xl font-black text-cocoa">
                With ForeverHome
              </h2>
            </div>
            <div className="space-y-4 relative">
              {[
                "Compatibility concerns are identified before adoption",
                "The shelter recommends a quieter home for Barnaby",
                "The adopter receives personalized transition support",
                "Daily check-ins build a visible progress timeline",
                "Shelter can monitor and intervene proactively",
                "Barnaby has a better-supported path to a permanent home",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-sage mt-0.5 shrink-0" />
                  <p className={`text-sm text-cocoa/70 font-medium leading-relaxed ${i === 5 ? "text-sage font-bold" : ""}`}>
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Progress Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-[28px] p-7 sm:p-10 border-2 border-cocoa shadow-[6px_6px_0px_0px_rgba(42,29,20,1)] mb-12 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-40 h-40 bg-honey/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-coral flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h2 className="font-display text-2xl font-black text-cocoa">
                Barnaby&apos;s Progress Timeline
              </h2>
            </div>

            <div className="space-y-3">
              {[
                { day: 1, text: "Wouldn't leave carrier for 4 hours", hiding: true },
                { day: 2, text: "Explored room briefly at night", hiding: true },
                { day: 3, text: "Came out for a few minutes, ate treats from hand", hiding: true },
                { day: 5, text: "Slept on the end of the bed!", hiding: false },
                { day: 7, text: "Playing with feather toy, lets me pet him", hiding: false },
                { day: 10, text: "Sitting on the couch next to me. This feels like home.", hiding: false },
              ].map((entry, idx) => (
                <motion.div
                  key={entry.day}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex items-start gap-4 p-4 rounded-2xl border-2 ${
                    entry.hiding
                      ? "border-risk-high/20 bg-risk-high/5"
                      : "border-sage/40 bg-sage/5"
                  }`}
                >
                  <span className="font-display text-sm font-bold text-cocoa w-14 shrink-0">
                    Day {entry.day}
                  </span>
                  <div className="flex items-center gap-2">
                    {entry.hiding ? (
                      <span className="text-xs font-bold text-risk-high bg-risk-high/10 px-2 py-0.5 rounded-full">Hiding</span>
                    ) : (
                      <span className="text-xs font-bold text-sage bg-sage/10 px-2 py-0.5 rounded-full">Emerging</span>
                    )}
                  </div>
                  <p className="text-sm text-cocoa/70 italic flex-1">
                    &ldquo;{entry.text}&rdquo;
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Theme Connection: Cat Domination */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-cocoa rounded-[32px] p-8 sm:p-12 border-2 border-cocoa shadow-[8px_8px_0px_0px_rgba(245,185,66,1)] relative overflow-hidden text-center"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-honey/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-coral/15 rounded-full blur-3xl" />
          <div className="relative space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-honey flex items-center justify-center border-2 border-cream/20">
                <Globe className="w-8 h-8 text-cocoa" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="font-display text-3xl sm:text-4xl font-black text-cream leading-tight">
                Every forever home is a new
                <br />
                <span className="text-honey italic">base of operations.</span>
              </h2>
              <p className="text-cream/70 font-medium text-lg max-w-xl mx-auto leading-relaxed">
                ForeverHome does not just help cats find homes. It helps them keep
                those homes — and establish one more permanent base for peaceful
                world domination. 🐾
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Trophy className="w-5 h-5 text-honey" />
              <span className="text-cream/50 text-sm font-bold">#HackTheKitty 2026</span>
              <PawPrint className="w-5 h-5 text-coral" />
            </div>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <p className="text-xs text-cocoa/40 font-medium text-center mt-8">
          This is an illustrative story, not a claim that the application
          guarantees an outcome. Individual results will vary.
        </p>
      </div>
    </div>
  );
}

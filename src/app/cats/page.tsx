"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { demoCats } from "@/data/demoCats";
import CatCard from "@/components/cats/CatCard";
import { SectionTag, StickerBadge, WhiskerInput } from "@/components/ui/CatElements";
import { Sparkles, PawPrint, Search, SlidersHorizontal, Cat } from "lucide-react";
import { Button } from "@/components/ui/button";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "male", label: "Boys" },
  { key: "female", label: "Girls" },
  { key: "kitten", label: "Kittens" },
  { key: "adult", label: "Adults" },
] as const;

export default function CatsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const filteredCats = useMemo(() => {
    return demoCats.filter((cat) => {
      const matchesSearch =
        cat.name.toLowerCase().includes(search.toLowerCase()) ||
        cat.breed.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        filter === "all" ||
        (filter === "male" && cat.sex === "male") ||
        (filter === "female" && cat.sex === "female") ||
        (filter === "kitten" && (cat.lifeStage === "kitten" || cat.lifeStage === "young")) ||
        (filter === "adult" && (cat.lifeStage === "adult" || cat.lifeStage === "senior"));
      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  return (
    <div className="min-h-screen pb-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 max-w-2xl mx-auto relative"
        >
          <StickerBadge color="honey" rotate={-6} className="absolute -top-2 right-0 sm:right-16 animate-float hidden sm:inline-flex">
            🐾 {demoCats.length} ready to adopt
          </StickerBadge>
          <SectionTag>Meet them</SectionTag>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-cocoa tracking-tight">
            Choose your{" "}
            <span className="text-gradient-warm italic">feline match</span>
          </h1>
          <p className="text-lg text-cocoa/60 font-medium max-w-2xl mx-auto leading-relaxed">
            Each cat has a unique behavioral profile and specific needs. Our
            compatibility engine compares these with your lifestyle to find the
            best fit — because every cat deserves a home that truly works for them.
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <StickerBadge color="sage" rotate={-2}>
              <Sparkles className="w-3 h-3" /> {demoCats.length} awesome cats
            </StickerBadge>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-5 border-2 border-cocoa shadow-[5px_5px_0px_0px_rgba(42,29,20,1)] space-y-4"
        >
          <div className="max-w-md mx-auto">
            <WhiskerInput
              placeholder="Search by name or breed..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          <div className="flex flex-wrap justify-center items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-cocoa/40 mr-1" />
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all border-2 ${
                  filter === f.key
                    ? "bg-cocoa text-cream border-cocoa shadow-[2px_2px_0px_0px_rgba(255,107,107,1)]"
                    : "bg-white text-cocoa border-cocoa/15 hover:border-cocoa"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Cat Grid */}
        {filteredCats.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredCats.map((cat, idx) => (
                <motion.div
                  key={cat.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <CatCard cat={cat} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto border-2 border-cocoa shadow-[5px_5px_0px_0px_rgba(42,29,20,1)]"
          >
            <div className="w-20 h-20 rounded-2xl bg-coral-light mx-auto mb-4 flex items-center justify-center border-2 border-cocoa">
              <Cat className="w-10 h-10 text-coral" />
            </div>
            <h3 className="font-display text-2xl font-black text-cocoa mb-2">No kitties found</h3>
            <p className="text-cocoa/60 font-medium mb-6">Try a different search or reset your filters.</p>
            <Button variant="outline" onClick={() => { setFilter("all"); setSearch(""); }}>
              Reset Filters
            </Button>
          </motion.div>
        )}

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 bg-cocoa/5 border-2 border-cocoa/20 rounded-full px-4 py-2">
            <PawPrint className="w-4 h-4 text-cocoa/40" />
            <span className="text-xs font-bold text-cocoa/40 uppercase tracking-widest">
              Real cats. Real needs. Real matches.
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

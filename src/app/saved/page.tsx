"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bookmark, Cat as CatIcon, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getIdToken } from "@/lib/auth";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { demoCats } from "@/data/demoCats";
import CatCard from "@/components/cats/CatCard";
import { Button } from "@/components/ui/button";
import { SectionTag } from "@/components/ui/CatElements";

export default function SavedPage() {
  return (
    <AuthGuard>
      <SavedContent />
    </AuthGuard>
  );
}

function SavedContent() {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getIdToken().then((token) => {
      fetch(`/api/saved?uid=${encodeURIComponent(user.uid)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((r) => r.json())
        .then((d) => setSavedIds(d.saved || []))
        .catch(() => setSavedIds([]))
        .finally(() => setLoading(false));
    });
  }, [user]);

  const savedCats = demoCats.filter((cat) => savedIds.includes(cat.id));

  return (
    <div className="min-h-screen pb-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 space-y-4"
        >
          <SectionTag>Your wishlist</SectionTag>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-cocoa tracking-tight">
            Cats you&apos;ve{" "}
            <span className="text-gradient-warm italic">saved</span>
          </h1>
          <p className="text-lg text-cocoa/60 font-medium max-w-2xl mx-auto leading-relaxed">
            Keep track of the cats you&apos;re considering. Come back anytime to
            compare and start a compatibility assessment.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-coral border-t-transparent" />
          </div>
        ) : savedCats.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[28px] border-2 border-cocoa/10 shadow-[4px_4px_0px_0px_rgba(42,29,20,1)] p-12 text-center max-w-md mx-auto"
          >
            <div className="w-16 h-16 rounded-2xl bg-coral/10 flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8 text-coral" />
            </div>
            <h2 className="font-display text-xl font-black text-cocoa mb-2">
              No saved cats yet
            </h2>
            <p className="text-sm text-cocoa/60 mb-6">
              Browse available cats and save the ones that catch your eye.
            </p>
            <Link href="/cats">
              <Button className="bg-coral text-white hover:bg-coral-deep rounded-full font-bold">
                <CatIcon className="w-4 h-4 mr-2" />
                Browse Cats
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedCats.map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
              >
                <CatCard cat={cat} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

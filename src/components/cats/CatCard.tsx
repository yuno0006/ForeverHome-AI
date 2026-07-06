"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Cat } from "@/types/cat";
import { Zap, Heart, Sparkles, MapPin, Clock } from "lucide-react";
import { getShelterById } from "@/data/demoShelters";
import { useAuth } from "@/hooks/useAuth";
import { getIdToken } from "@/lib/auth";

interface CatCardProps {
  cat: Cat;
}

const energyLabels: Record<string, string> = {
  low: "Calm",
  medium: "Moderate",
  high: "Energetic",
};

const sociabilityLabels: Record<string, string> = {
  reserved: "Quiet",
  moderate: "Balanced",
  outgoing: "Social",
};

export default function CatCard({ cat }: CatCardProps) {
  const shelter = getShelterById(cat.shelterId);
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) {
      setSaved(false);
      return;
    }
    getIdToken().then((token) => {
      fetch(`/api/saved?uid=${encodeURIComponent(user.uid)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((r) => r.json())
        .then((d) => setSaved((d.saved || []).includes(cat.id)))
        .catch(() => {});
    });
  }, [user, cat.id]);

  const toggleSaved = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || busy) return;
    setBusy(true);
    try {
      const token = await getIdToken();
      const method = saved ? "DELETE" : "POST";
      const res = await fetch("/api/saved", {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ uid: user.uid, catId: cat.id }),
      });
      if (res.ok) setSaved(!saved);
    } catch {
      // silently ignore — non-critical UX feature
    } finally {
      setBusy(false);
    }
  };

  return (
    <Link href={`/cats/${cat.id}`}>
      <div className="overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
        <div className="relative h-64 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cat.photo}
            alt={cat.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* Status Badge */}
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-sage text-white font-semibold rounded-full px-3 border-2 border-cocoa shadow-[2px_2px_0px_0px_rgba(42,29,20,1)]">
              {cat.status === "available" ? "Available" : cat.status}
            </Badge>
          </div>

          {/* Top-right stack: save button + medical badge */}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
            {user && (
              <button
                type="button"
                onClick={toggleSaved}
                aria-label={saved ? `Remove ${cat.name} from wishlist` : `Save ${cat.name} to wishlist`}
                aria-pressed={saved}
                disabled={busy}
                className={`h-9 w-9 rounded-xl flex items-center justify-center border-2 border-cocoa shadow-[3px_3px_0px_0px_rgba(42,29,20,1)] transition-all active:scale-90 ${
                  saved ? "bg-coral" : "bg-white"
                }`}
              >
                <Heart className={`w-5 h-5 transition-all ${saved ? "text-white fill-white scale-110" : "text-cocoa"}`} />
              </button>
            )}
            {cat.care.knownMedicalNeeds !== "None" && (
              <Badge className="bg-lavender text-white rounded-full px-3 py-1 text-[11px] font-bold border-2 border-cocoa shadow-[2px_2px_0px_0px_rgba(42,29,20,1)]">
                <Heart className="h-3 w-3 mr-1" /> Special Care
              </Badge>
            )}
          </div>
          
          {/* Days in Shelter */}
          {cat.daysInShelter && cat.daysInShelter > 30 && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-honey text-cocoa rounded-full px-3 py-1 text-[11px] font-bold border-2 border-cocoa shadow-[2px_2px_0px_0px_rgba(42,29,20,1)]">
                <Clock className="h-3 w-3 mr-1" /> {cat.daysInShelter} days waiting
              </Badge>
            </div>
          )}
        </div>
        
        <div className="p-5 space-y-3">
          {/* Name, Age */}
          <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl font-black text-cocoa">{cat.name}</h3>
            <span className="text-sm text-cocoa/60 font-bold">
              {cat.age} {cat.lifeStage === "kitten" ? "months" : "yrs"}
            </span>
          </div>
          
          {/* Breed & Color */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-cocoa/60">{cat.breed}</span>
            <span className="text-xs text-cocoa/30">•</span>
            <span className="text-sm font-semibold text-cocoa/60">{cat.color}</span>
          </div>
          
          {/* Personality trait */}
          {cat.personality && cat.personality.length > 0 && (
            <p className="text-sm text-cocoa/50 italic leading-relaxed">
              &ldquo;{cat.personality[0].trait}&rdquo;
            </p>
          )}

          {/* Behavior Badges */}
          <div className="flex flex-wrap gap-1.5">
            <Badge className="gap-1.5 rounded-full bg-coral-light text-cocoa text-xs font-bold border-2 border-coral/30 px-2.5 py-1">
              <Zap className="h-3.5 w-3.5 text-coral" />
              {energyLabels[cat.behavior.energy]}
            </Badge>
            <Badge className="gap-1.5 rounded-full bg-lavender-light text-cocoa text-xs font-bold border-2 border-lavender/30 px-2.5 py-1">
              <Sparkles className="h-3.5 w-3.5 text-lavender" />
              {sociabilityLabels[cat.behavior.sociability]}
            </Badge>
            {cat.behavior.stressSensitivity === "high" && (
              <Badge className="gap-1.5 rounded-full bg-honey-light text-cocoa text-xs font-bold border-2 border-honey/30 px-2.5 py-1">
                Sensitive
              </Badge>
            )}
            {cat.care.fivStatus === "positive" && (
              <Badge className="gap-1.5 rounded-full bg-lavender-light text-lavender-deep text-xs font-bold border-2 border-lavender/30 px-2.5 py-1">
                FIV+
              </Badge>
            )}
          </div>

          {/* Special Notes */}
          <p className="text-sm text-cocoa/50 line-clamp-2 leading-relaxed">
            {cat.care.specialNotes}
          </p>
          
          {/* Shelter Info */}
          {shelter && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-cocoa/40">
              <MapPin className="h-3.5 w-3.5" />
              <span>{shelter.name}</span>
              <span className="mx-1">•</span>
              <span>{shelter.location.city}, {shelter.location.state}</span>
            </div>
          )}

          {/* CTA */}
          <p className="text-sm font-bold text-coral group-hover:text-coral-deep transition-colors flex items-center gap-1">
            Meet {cat.name} <Sparkles className="w-3.5 h-3.5" />
          </p>
        </div>
      </div>
    </Link>
  );
}

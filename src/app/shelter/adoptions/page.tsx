"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Cat,
  Calendar,
  Eye,
  Activity,
  Clock,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  ShieldAlert,
  Loader2,
} from "lucide-react";

interface AdoptionRequest {
  id: string;
  catId: string;
  catName: string;
  shelterId: string;
  adopterUid: string | null;
  adopterName: string;
  adopterEmail: string;
  adopterPhone: string | null;
  compatibilityLevel: "low" | "moderate" | "high";
  aiExplanation?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
}

interface ActiveAdoption {
  id: string;
  catName: string;
  catPhoto: string | null;
  adopterName: string;
  currentDay: number;
  lastCheckIn: string;
}

const demoActiveAdoptions: ActiveAdoption[] = [
  {
    id: "adoption-1",
    catName: "Barnaby",
    catPhoto: null,
    adopterName: "Margaret",
    currentDay: 3,
    lastCheckIn: "Came out for treats",
  },
  {
    id: "adoption-2",
    catName: "Luna",
    catPhoto: null,
    adopterName: "Sarah",
    currentDay: 7,
    lastCheckIn: "Playing with feather toy",
  },
];

const compatibilityColors: Record<string, string> = {
  high: "bg-green-100 text-green-800 border-green-200",
  moderate: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-orange-100 text-orange-800 border-orange-200",
};

const compatibilityLabels: Record<string, string> = {
  high: "Strong Match",
  moderate: "Moderate Match",
  low: "Needs Review",
};

export default function ShelterAdoptionsPage() {
  const { userDoc } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<AdoptionRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [animatingOut, setAnimatingOut] = useState<Record<string, "approve" | "reject">>({});

  const fetchPendingRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const res = await fetch("/api/adoption-requests?status=pending");
      if (res.ok) {
        const data = await res.json();
        setPendingRequests(data.requests || []);
      }
    } catch (err) {
      console.error("Failed to fetch adoption requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  async function handleAction(requestId: string, action: "approve" | "reject") {
    setActionLoading(requestId);
    try {
      const res = await fetch(`/api/adoption-request/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        setAnimatingOut((prev) => ({ ...prev, [requestId]: action }));

        if (action === "approve") {
          toast.success("Application Approved!", {
            description: "The adoption process is moving forward.",
          });
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FF6B6B', '#5FC79B', '#F5B942']
          });
        } else {
          toast.error("Application Rejected", {
            description: "The applicant has been notified.",
          });
        }

        // Delay to let the color change & overlay animation finish
        await new Promise((resolve) => setTimeout(resolve, 850));

        // Save to sessionStorage for local demo persistence!
        if (action === "approve" && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
          const reqDetails = pendingRequests.find((r) => r.id === requestId);
          if (reqDetails) {
            const approvedAdoptions = JSON.parse(sessionStorage.getItem("activeAdoptions") || "[]");
            approvedAdoptions.push({
              id: `adoption-${Date.now()}`,
              catId: reqDetails.catId,
              catName: reqDetails.catName,
              adopterName: reqDetails.adopterName,
              adopterEmail: reqDetails.adopterEmail,
              adopterUid: reqDetails.adopterUid || null,
              currentDay: 1,
              lastCheckIn: "Adopted! Day 1 check-in pending.",
            });
            sessionStorage.setItem("activeAdoptions", JSON.stringify(approvedAdoptions));
          }
        }

        // Remove from pending list
        setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
        
        // Clean up animation state after exit transition finishes
        setTimeout(() => {
          setAnimatingOut((prev) => {
            const copy = { ...prev };
            delete copy[requestId];
            return copy;
          });
        }, 1000);
      }
    } catch (err) {
      console.error(`Failed to ${action} request:`, err);
    } finally {
      setActionLoading(null);
    }
  }

  function formatTimeAgo(isoString: string): string {
    const diff = Date.now() - new Date(isoString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  return (
    <Tabs defaultValue="pending" className="max-w-5xl mx-auto px-4 py-8 relative z-10">
      {/* Decorative Floating Elements */}
      <div className="absolute top-4 right-10 w-24 h-24 bg-gradient-to-br from-coral/10 to-honey/10 rounded-full blur-xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-10 left-4 w-32 h-32 bg-gradient-to-br from-sage/10 to-lavender/10 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* Header section */}
      <div className="mb-10 relative flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border-2 border-cocoa/10 shadow-[2px_2px_0px_0px_rgba(42,29,20,0.1)] text-xs font-bold text-cocoa/60 mb-3">
            <Heart className="w-3.5 h-3.5 text-coral animate-pulse" /> Shelter Management Portal
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-cocoa tracking-tight leading-none">
            Adoptions Hub
          </h1>
          <p className="mt-3 text-base text-cocoa/60 font-medium max-w-xl leading-relaxed">
            Review pending adoption applications, assess compatibility, and track active 14-day transition journeys.
          </p>
        </div>

        {/* Tabs styled as top-right buttons */}
        <div className="w-full lg:w-auto flex justify-end">
          <TabsList className="bg-white/90 backdrop-blur-md p-1.5 rounded-full border-2 border-cocoa/10 shadow-[4px_4px_0px_0px_rgba(42,29,20,0.08)] inline-flex w-fit gap-2">
            <TabsTrigger
              value="pending"
              className="group relative rounded-full py-2.5 px-5 font-black text-sm transition-all duration-300 ease-out gap-2 flex items-center justify-center cursor-pointer text-cocoa/60 hover:text-cocoa hover:bg-cocoa/5 hover:-translate-y-0.5 data-selected:bg-cocoa data-selected:text-cream data-selected:shadow-[4px_4px_0px_0px_rgba(255,107,107,1)] data-selected:-translate-y-0.5 active:translate-y-0 active:shadow-none"
            >
              <ShieldAlert className="h-4 w-4 shrink-0 transition-all duration-300 group-hover:scale-110 group-data-selected:text-coral" />
              <span>Applications</span>
              {pendingRequests.length > 0 && (
                <Badge className="bg-heart text-white h-5 min-w-5 flex items-center justify-center text-[10px] font-black border border-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-data-selected:animate-pulse">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="group relative rounded-full py-2.5 px-5 font-black text-sm transition-all duration-300 ease-out gap-2 flex items-center justify-center cursor-pointer text-cocoa/60 hover:text-cocoa hover:bg-cocoa/5 hover:-translate-y-0.5 data-selected:bg-cocoa data-selected:text-cream data-selected:shadow-[4px_4px_0px_0px_rgba(255,107,107,1)] data-selected:-translate-y-0.5 active:translate-y-0 active:shadow-none"
            >
              <Heart className="h-4 w-4 shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:text-coral group-data-selected:text-coral group-data-selected:animate-pulse" />
              <span>Active Journeys</span>
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

        {/* ================================================================ */}
        {/* PENDING APPLICATIONS TAB                                         */}
        {/* ================================================================ */}
        <TabsContent value="pending" className="outline-none">
          {loadingRequests ? (
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-cocoa/10 rounded-2xl shadow-[4px_4px_0px_0px_rgba(42,29,20,1)]">
              <CardContent className="py-16 text-center">
                <Loader2 className="h-10 w-10 text-coral animate-spin mx-auto mb-4" />
                <p className="text-sm text-cocoa/50 font-bold">Loading applications...</p>
              </CardContent>
            </Card>
          ) : pendingRequests.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-cocoa/10 rounded-2xl shadow-[4px_4px_0px_0px_rgba(42,29,20,1)]">
              <CardContent className="py-16 text-center max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 bg-sage/10 border-2 border-sage/20 rounded-2xl flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_rgba(95,199,155,0.2)]">
                  <CheckCircle className="h-8 w-8 text-sage" />
                </div>
                <h3 className="font-display text-2xl font-black text-cocoa">All Caught Up!</h3>
                <p className="text-sm text-cocoa/60 font-medium leading-relaxed">
                  There are no pending adoption applications to review right now. New submissions will pop up here!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-8">
              <AnimatePresence mode="popLayout">
                {pendingRequests.map((request) => {
                  const isApproving = animatingOut[request.id] === "approve";
                  const isRejecting = animatingOut[request.id] === "reject";

                  return (
                    <motion.div
                      key={request.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={
                        isRejecting
                          ? { x: -300, opacity: 0, scale: 0.9, filter: "blur(4px)" }
                          : { x: 300, opacity: 0, scale: 0.9, filter: "blur(4px)" }
                      }
                      transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                    >
                      <Card
                        className={`relative rounded-[2rem] transition-all duration-500 overflow-hidden border-2 ${
                          isApproving
                            ? "border-sage bg-sage-light/40 shadow-[0_0_25px_rgba(95,199,155,0.4)] scale-[0.98]"
                            : isRejecting
                            ? "border-coral bg-coral-light/40 shadow-[0_0_25px_rgba(255,107,107,0.4)] scale-[0.98]"
                            : "bg-white border-cocoa/15 hover:shadow-[8px_8px_0px_0px_rgba(42,29,20,1)]"
                        }`}
                      >
                        {/* Status overlays for Approve/Reject transitions */}
                        {isApproving && (
                          <div className="absolute inset-0 bg-gradient-to-r from-sage/20 via-sunny/10 to-sage/20 flex items-center justify-center pointer-events-none z-20 animate-pulse backdrop-blur-[1px]">
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-4xl animate-bounce">✨ Approved! 🐾</span>
                              <span className="text-sm font-black text-sage-deep uppercase tracking-widest">Adding to Active Journeys...</span>
                            </div>
                          </div>
                        )}
                        {isRejecting && (
                          <div className="absolute inset-0 bg-gradient-to-r from-coral/20 to-coral/10 flex items-center justify-center pointer-events-none z-20 backdrop-blur-[1px]">
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-4xl animate-wiggle">❌ Rejected</span>
                              <span className="text-sm font-black text-coral-deep uppercase tracking-widest font-sans">Removing Request...</span>
                            </div>
                          </div>
                        )}
                  <CardContent className="p-8 sm:p-10">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-8 sm:gap-10">
                      {/* Left: Info details */}
                      <div className="flex items-start gap-6 flex-1 min-w-0">
                        <div className="h-20 w-20 rounded-[1.5rem] bg-gradient-to-br from-coral/15 to-honey/15 flex items-center justify-center shrink-0 border-2 border-cocoa/10 shadow-sm">
                          <Cat className="h-10 w-10 text-coral" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="text-xl font-extrabold text-cocoa">
                              Adopting {request.catName}
                            </h3>
                            <Badge
                              className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border-2 ${
                                request.compatibilityLevel === "high"
                                  ? "bg-sage/15 text-sage-deep border-sage/30"
                                  : request.compatibilityLevel === "moderate"
                                  ? "bg-honey/15 text-honey border-honey/30"
                                  : "bg-coral/15 text-coral-deep border-coral/30"
                              }`}
                            >
                              {request.compatibilityLevel === "high"
                                ? "Excellent Fit"
                                : request.compatibilityLevel === "moderate"
                                ? "Moderate Match"
                                : "Needs AI Review"}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-cocoa/70 font-semibold">
                            Applicant: <span className="text-cocoa font-bold">{request.adopterName}</span>
                          </p>

                          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-cocoa/60 font-semibold">
                            <span className="flex items-center gap-2 bg-cocoa/5 px-3 py-1.5 rounded-lg border border-cocoa/10">
                              <Mail className="h-4 w-4 text-cocoa/50" />
                              {request.adopterEmail}
                            </span>
                            {request.adopterPhone && (
                              <span className="flex items-center gap-2 bg-cocoa/5 px-3 py-1.5 rounded-lg border border-cocoa/10">
                                <Phone className="h-4 w-4 text-cocoa/50" />
                                {request.adopterPhone}
                              </span>
                            )}
                            <span className="flex items-center gap-2 bg-cocoa/5 px-3 py-1.5 rounded-lg border border-cocoa/10">
                              <Clock className="h-4 w-4 text-cocoa/50" />
                              Applied {formatTimeAgo(request.createdAt)}
                            </span>
                          </div>

                          {request.aiExplanation && (
                            <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-sunny/10 to-coral/5 border-2 border-sunny/20 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-sunny/20 rounded-xl shadow-sm border border-sunny/30">
                                  <Activity className="w-5 h-5 text-honey" />
                                </div>
                                <span className="text-xs font-black text-cocoa uppercase tracking-widest">AI Compatibility Report</span>
                              </div>
                              <p className="text-[15px] text-cocoa/80 leading-relaxed font-medium">
                                {request.aiExplanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-3 shrink-0 lg:flex-col sm:flex-row flex-col w-full lg:w-48 sm:w-auto lg:mt-0 mt-4">
                        <Button
                          size="sm"
                          className="w-full sm:w-auto bg-sage text-white hover:bg-sage-deep rounded-xl font-bold gap-2 px-5 py-5 shadow-[3px_3px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-0.5 transition-all border-2 border-cocoa cursor-pointer"
                          onClick={() => handleAction(request.id, "approve")}
                          disabled={actionLoading === request.id}
                        >
                          {actionLoading === request.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          Approve Application
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full sm:w-auto border-2 border-cocoa text-cocoa/60 hover:text-coral hover:bg-coral/5 rounded-xl font-bold gap-2 px-5 py-5 shadow-[3px_3px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-0.5 transition-all cursor-pointer"
                          onClick={() => handleAction(request.id, "reject")}
                          disabled={actionLoading === request.id}
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                    </Card>
                  </motion.div>
                )})}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        {/* ================================================================ */}
        {/* ACTIVE ADOPTIONS TAB                                             */}
        {/* ================================================================ */}
        <TabsContent value="active" className="outline-none">
          {demoActiveAdoptions.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-cocoa/10 rounded-2xl shadow-[4px_4px_0px_0px_rgba(42,29,20,1)]">
              <CardContent className="py-16 text-center max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 bg-coral/10 border-2 border-coral/20 rounded-2xl flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_rgba(255,107,107,0.2)]">
                  <Heart className="h-8 w-8 text-coral animate-pulse" />
                </div>
                <h3 className="font-display text-2xl font-black text-cocoa">No Active Journeys</h3>
                <p className="text-sm text-cocoa/60 font-medium leading-relaxed">
                  When adoption applications are approved, the 14-day transition/onboarding journey tracking begins here!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-8">
              {demoActiveAdoptions.map((adoption) => {
                // Calculate percentage progress through 14-day schedule
                const percent = Math.min(100, Math.max(0, (adoption.currentDay / 14) * 100));

                return (
                  <Card
                    key={adoption.id}
                    className="bg-white border-2 border-cocoa/15 rounded-[2rem] hover:shadow-[8px_8px_0px_0px_rgba(42,29,20,1)] transition-all duration-300 overflow-hidden"
                  >
                    <CardContent className="p-8 sm:p-10">
                      <div className="flex flex-col md:flex-row gap-8 sm:gap-10">
                        {/* Left: Avatar / Name Info */}
                        <div className="flex sm:flex-row flex-col gap-6 items-center md:items-start shrink-0 md:w-64">
                          <div className="h-24 w-24 rounded-[1.5rem] bg-gradient-to-br from-sunny/20 to-coral/15 flex items-center justify-center shrink-0 border-2 border-cocoa/10 relative overflow-hidden shadow-sm">
                            {adoption.catPhoto ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={adoption.catPhoto}
                                alt={adoption.catName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Cat className="h-10 w-10 text-coral" />
                            )}
                          </div>
                          
                          <div className="text-center sm:text-left space-y-2 mt-2">
                            <h3 className="text-2xl font-black text-cocoa tracking-tight leading-none">{adoption.catName}</h3>
                            <p className="text-sm text-cocoa/70 font-bold">
                              Adopted by <span className="text-coral font-extrabold">{adoption.adopterName}</span>
                            </p>
                            <Badge className="bg-honey/15 border-2 border-honey/20 text-honey-deep font-black text-[11px] tracking-wider uppercase px-3 py-1 rounded-xl flex items-center gap-1.5 mt-2 justify-center sm:justify-start shadow-sm">
                              <Calendar className="h-3.5 w-3.5" />
                              Day {adoption.currentDay} of 14
                            </Badge>
                          </div>
                        </div>

                        {/* Right: Journey Progress & Check-in */}
                        <div className="flex-1 space-y-5">
                          {/* 14-Day Timeline Progress Tracker */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs font-bold text-cocoa/60">
                              <span>9-Lives Journey Progress</span>
                              <span>{Math.round(percent)}% Complete</span>
                            </div>
                            
                            {/* Track Container */}
                            <div className="relative h-4 bg-cocoa/5 rounded-full border-2 border-cocoa/10 p-0.5 overflow-visible">
                              {/* Glowing progress line */}
                              <div
                                className="h-full bg-gradient-to-r from-coral to-honey rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${percent}%` }}
                              />
                              
                              {/* Sliding Paw Icon */}
                              <div 
                                className="absolute top-1/2 -translate-y-1/2 -ml-3.5 transition-all duration-500 ease-out"
                                style={{ left: `${percent}%` }}
                              >
                                <div className="w-7 h-7 rounded-full bg-white border-2 border-cocoa shadow-sm flex items-center justify-center">
                                  🐾
                                </div>
                              </div>
                            </div>

                            {/* Milestones Label */}
                            <div className="flex justify-between text-[10px] font-black text-cocoa/40 uppercase tracking-widest pt-1 px-1">
                              <span>Day 1: Arrival</span>
                              <span>Day 7: Exploration</span>
                              <span>Day 14: Forever Home</span>
                            </div>
                          </div>

                          {/* Last Check-in Text */}
                          <div className="p-5 rounded-2xl bg-cream border-2 border-cocoa/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
                            <div className="flex items-center gap-2.5 text-xs font-black text-cocoa/60 uppercase tracking-wider mb-2">
                              <Activity className="h-4 w-4 text-coral animate-pulse" />
                              <span>Latest Check-in Update</span>
                            </div>
                            <p className="text-[15px] font-medium text-cocoa/80 italic leading-relaxed">
                              &ldquo;{adoption.lastCheckIn || "No updates submitted yet"}&rdquo;
                            </p>
                          </div>

                          {/* Action Button */}
                          <div className="flex justify-end pt-2">
                            <Link href={`/coach/${adoption.id}`}>
                              <Button
                                variant="outline"
                                size="default"
                                className="border-2 border-cocoa text-cocoa font-black rounded-xl hover:bg-honey/15 shadow-[3px_3px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-0.5 transition-all gap-2 px-6 py-5 cursor-pointer"
                              >
                                <Eye className="h-5 w-5" />
                                View Full Journey & Coach Logs
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
    </Tabs>
  );
}

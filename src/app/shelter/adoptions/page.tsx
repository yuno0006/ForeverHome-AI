"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
    <div className="max-w-5xl mx-auto px-4 py-8 relative z-10">
      {/* Decorative Floating Elements */}
      <div className="absolute top-4 right-10 w-24 h-24 bg-gradient-to-br from-coral/10 to-honey/10 rounded-full blur-xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-10 left-4 w-32 h-32 bg-gradient-to-br from-sage/10 to-lavender/10 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* Header section */}
      <div className="mb-10 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border-2 border-cocoa/10 shadow-[2px_2px_0px_0px_rgba(42,29,20,0.1)] text-xs font-bold text-cocoa/60 mb-3">
          <Heart className="w-3..5 h-3.5 text-coral animate-pulse" /> Shelter Management Portal
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-black text-cocoa tracking-tight leading-none">
          Adoptions Hub
        </h1>
        <p className="mt-2 text-base text-cocoa/60 font-medium max-w-xl">
          Review pending adoption applications, assess compatibility, and track active 14-day transition journeys.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl border-2 border-cocoa/10 shadow-[3px_3px_0px_0px_rgba(42,29,20,0.08)] flex w-full max-w-md">
          <TabsTrigger
            value="pending"
            className="flex-1 rounded-xl py-3 font-bold text-sm transition-all data-[state=active]:bg-cocoa data-[state=active]:text-cream data-[state=active]:shadow-[2px_2px_0px_0px_rgba(255,107,107,1)] gap-2 flex items-center justify-center cursor-pointer"
          >
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>Applications</span>
            {pendingRequests.length > 0 && (
              <Badge className="bg-heart text-white h-5 min-w-5 flex items-center justify-center text-[10px] font-black border border-white">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="flex-1 rounded-xl py-3 font-bold text-sm transition-all data-[state=active]:bg-cocoa data-[state=active]:text-cream data-[state=active]:shadow-[2px_2px_0px_0px_rgba(255,107,107,1)] gap-2 flex items-center justify-center cursor-pointer"
          >
            <Heart className="h-4 w-4 shrink-0" />
            <span>Active Journeys</span>
          </TabsTrigger>
        </TabsList>

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
            <div className="grid gap-6">
              {pendingRequests.map((request) => (
                <Card
                  key={request.id}
                  className="bg-white border-2 border-cocoa/15 rounded-2xl hover:shadow-[6px_6px_0px_0px_rgba(42,29,20,1)] transition-all duration-200 overflow-hidden"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      {/* Left: Info details */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-coral/10 to-honey/10 flex items-center justify-center shrink-0 border-2 border-cocoa/10">
                          <Cat className="h-7 w-7 text-coral" />
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

                          <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-2.5 text-xs text-cocoa/50 font-medium">
                            <span className="flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5 text-cocoa/40" />
                              {request.adopterEmail}
                            </span>
                            {request.adopterPhone && (
                              <span className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-cocoa/40" />
                                {request.adopterPhone}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-cocoa/40" />
                              Applied {formatTimeAgo(request.createdAt)}
                            </span>
                          </div>

                          {request.aiExplanation && (
                            <div className="mt-4 p-3.5 rounded-xl bg-sunny/10 border border-sunny/20">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <Activity className="w-4 h-4 text-sunny" />
                                <span className="text-[11px] font-bold text-cat-dark uppercase tracking-wider">AI Compatibility Summary</span>
                              </div>
                              <p className="text-sm text-charcoal/80 leading-relaxed italic">
                                &ldquo;{request.aiExplanation}&rdquo;
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-3 shrink-0 lg:flex-row sm:flex-row flex-col w-full sm:w-auto">
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
              ))}
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
            <div className="grid gap-6">
              {demoActiveAdoptions.map((adoption) => {
                // Calculate percentage progress through 14-day schedule
                const percent = Math.min(100, Math.max(0, (adoption.currentDay / 14) * 100));

                return (
                  <Card
                    key={adoption.id}
                    className="bg-white border-2 border-cocoa/15 rounded-3xl hover:shadow-[6px_6px_0px_0px_rgba(42,29,20,1)] transition-all duration-200 overflow-hidden"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Left: Avatar / Name Info */}
                        <div className="flex sm:flex-row flex-col gap-4 items-center md:items-start shrink-0">
                          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-sunny/20 to-coral/15 flex items-center justify-center shrink-0 border-2 border-cocoa/10 relative overflow-hidden">
                            {adoption.catPhoto ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={adoption.catPhoto}
                                alt={adoption.catName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Cat className="h-9 w-9 text-coral" />
                            )}
                          </div>
                          
                          <div className="text-center sm:text-left space-y-1">
                            <h3 className="text-xl font-extrabold text-cocoa tracking-tight">{adoption.catName}</h3>
                            <p className="text-xs text-cocoa/60 font-bold">
                              Adopted by <span className="text-coral font-extrabold">{adoption.adopterName}</span>
                            </p>
                            <Badge className="bg-honey/15 border-2 border-honey/20 text-honey font-bold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-lg flex items-center gap-1 mt-1 justify-center sm:justify-start">
                              <Calendar className="h-3 w-3" />
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
                          <div className="p-4 rounded-2xl bg-cream border-2 border-cocoa/10 shadow-[3px_3px_0px_0px_rgba(42,29,20,0.05)]">
                            <div className="flex items-center gap-2 text-xs font-black text-cocoa/60 uppercase tracking-wider mb-1.5">
                              <Activity className="h-4 w-4 text-coral animate-pulse" />
                              <span>Latest Check-in Update</span>
                            </div>
                            <p className="text-sm font-medium text-cocoa/80 italic">
                              &ldquo;{adoption.lastCheckIn || "No updates submitted yet"}&rdquo;
                            </p>
                          </div>

                          {/* Action Button */}
                          <div className="flex justify-end pt-1">
                            <Link href={`/coach/${adoption.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-2 border-cocoa text-cocoa font-bold rounded-xl hover:bg-honey/15 shadow-[2px_2px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-0.5 transition-all gap-1.5 cursor-pointer"
                              >
                                <Eye className="h-4 w-4" />
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
    </div>
  );
}

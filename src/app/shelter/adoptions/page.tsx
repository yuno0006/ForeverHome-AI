"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
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

export default function ShelterAdoptionsPage() {
  const { userDoc: _userDoc } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<AdoptionRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
    <Tabs defaultValue="pending" className="max-w-5xl mx-auto px-4 py-8 relative z-10">
      {/* Decorative Floating Elements */}
      <div className="absolute top-4 right-10 w-24 h-24 bg-gradient-to-br from-coral/10 to-honey/10 rounded-full blur-xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-10 left-4 w-32 h-32 bg-gradient-to-br from-sage/10 to-lavender/10 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* ─── HEADER: stacked vertical layout, clean and organized ─── */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border-2 border-cocoa/10 shadow-[2px_2px_0px_0px_rgba(42,29,20,0.1)] text-xs font-bold text-cocoa/60 mb-3">
          <Heart className="w-3.5 h-3.5 text-coral animate-pulse" /> Shelter Management Portal
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-black text-cocoa tracking-tight leading-none">
          Adoptions Hub
        </h1>
        <p className="mt-2 text-base text-cocoa/60 font-medium max-w-2xl leading-relaxed">
          Review pending adoption applications, assess compatibility, and track active 14-day transition journeys.
        </p>
      </div>

      {/* ─── TABS: full-width, below header ─── */}
      <TabsList className="w-full bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border-2 border-cocoa/10 shadow-[4px_4px_0px_0px_rgba(42,29,20,0.08)] grid grid-cols-2 gap-1 mb-8">
        <TabsTrigger
          value="pending"
          className="rounded-xl py-3 font-black text-sm transition-all duration-200 data-[state=active]:bg-cocoa data-[state=active]:text-cream data-[state=active]:shadow-[2px_2px_0px_0px_rgba(255,107,107,1)] gap-2 flex items-center justify-center cursor-pointer hover:bg-cocoa/5"
        >
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>Applications</span>
          {pendingRequests.length > 0 && (
            <Badge className="bg-heart text-white h-5 min-w-5 flex items-center justify-center text-[10px] font-black border border-white shadow-sm ml-1">
              {pendingRequests.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="active"
          className="rounded-xl py-3 font-black text-sm transition-all duration-200 data-[state=active]:bg-cocoa data-[state=active]:text-cream data-[state=active]:shadow-[2px_2px_0px_0px_rgba(255,107,107,1)] gap-2 flex items-center justify-center cursor-pointer hover:bg-cocoa/5"
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
          <div className="space-y-6">
            {pendingRequests.map((request) => (
              <Card
                key={request.id}
                className="bg-white border-2 border-cocoa/15 rounded-2xl hover:shadow-[6px_6px_0px_0px_rgba(42,29,20,1)] transition-all duration-200 overflow-hidden"
              >
                <CardContent className="p-6 sm:p-8">
                  {/* ── Top: Cat icon + Name + Badge + Applicant ── */}
                  <div className="flex items-start gap-5 mb-5">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-coral/15 to-honey/15 flex items-center justify-center shrink-0 border-2 border-cocoa/10 shadow-sm">
                      <Cat className="h-8 w-8 text-coral" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap mb-1">
                        <h3 className="text-lg font-extrabold text-cocoa">
                          {request.catName}
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
                      <p className="text-sm text-cocoa/60 font-medium">
                        Applicant: <span className="text-cocoa font-bold">{request.adopterName}</span>
                        <span className="mx-2 text-cocoa/20">|</span>
                        <Mail className="h-3.5 w-3.5 inline text-cocoa/40 mr-1" />
                        {request.adopterEmail}
                        {request.adopterPhone && (
                          <>
                            <span className="mx-2 text-cocoa/20">|</span>
                            <Phone className="h-3.5 w-3.5 inline text-cocoa/40 mr-1" />
                            {request.adopterPhone}
                          </>
                        )}
                        <span className="mx-2 text-cocoa/20">|</span>
                        <Clock className="h-3.5 w-3.5 inline text-cocoa/40 mr-1" />
                        Applied {formatTimeAgo(request.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* ── AI Report (if present) ── */}
                  {request.aiExplanation && (
                    <div className="mb-5 p-5 rounded-xl bg-gradient-to-br from-sunny/8 to-coral/5 border border-sunny/15">
                      <div className="flex items-center gap-2.5 mb-3">
                        <Activity className="w-4 h-4 text-honey" />
                        <span className="text-xs font-black text-cocoa/60 uppercase tracking-wider">AI Compatibility Report</span>
                      </div>
                      <p className="text-sm text-cocoa/75 leading-relaxed font-medium">
                        {request.aiExplanation}
                      </p>
                    </div>
                  )}

                  {/* ── Bottom: Action buttons in a row ── */}
                  <div className="flex items-center gap-3 pt-2 border-t border-cocoa/10">
                    <Button
                      className="flex-1 sm:flex-none bg-sage text-white hover:bg-sage-deep rounded-xl font-bold gap-2 px-6 py-4 shadow-[3px_3px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-0.5 transition-all border-2 border-cocoa cursor-pointer"
                      onClick={() => handleAction(request.id, "approve")}
                      disabled={actionLoading === request.id}
                    >
                      {actionLoading === request.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 sm:flex-none border-2 border-cocoa/20 text-cocoa/50 hover:text-coral hover:border-coral/30 hover:bg-coral/5 rounded-xl font-bold gap-2 px-6 py-4 shadow-[3px_3px_0px_0px_rgba(42,29,20,0.5)] hover:-translate-y-0.5 transition-all cursor-pointer"
                      onClick={() => handleAction(request.id, "reject")}
                      disabled={actionLoading === request.id}
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
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
                When adoption applications are approved, the 14-day transition journey tracking begins here!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
            {demoActiveAdoptions.map((adoption) => {
              const percent = Math.min(100, Math.max(0, (adoption.currentDay / 14) * 100));

              return (
                <Card
                  key={adoption.id}
                  className="bg-white border-2 border-cocoa/15 rounded-2xl hover:shadow-[6px_6px_0px_0px_rgba(42,29,20,1)] transition-all duration-200 overflow-hidden"
                >
                  <CardContent className="p-6 flex flex-col h-full">
                    {/* ── Cat avatar + name + day badge ── */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-sunny/20 to-coral/15 flex items-center justify-center shrink-0 border-2 border-cocoa/10 overflow-hidden shadow-sm">
                        {adoption.catPhoto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={adoption.catPhoto} alt={adoption.catName} className="h-full w-full object-cover" />
                        ) : (
                          <Cat className="h-7 w-7 text-coral" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-extrabold text-cocoa">{adoption.catName}</h3>
                          <Badge className="bg-honey/15 border-2 border-honey/20 text-honey-deep font-black text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                            <Calendar className="h-3 w-3" />
                            Day {adoption.currentDay}/14
                          </Badge>
                        </div>
                        <p className="text-xs text-cocoa/60 font-medium mt-0.5">
                          with <span className="text-cocoa font-bold">{adoption.adopterName}</span>
                        </p>
                      </div>
                    </div>

                    {/* ── Progress bar ── */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center text-[10px] font-bold text-cocoa/50 uppercase tracking-wider mb-1.5">
                        <span>Journey Progress</span>
                        <span>{Math.round(percent)}%</span>
                      </div>
                      <div className="relative h-3 bg-cocoa/5 rounded-full border border-cocoa/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-coral to-honey rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* ── Latest check-in ── */}
                    <div className="p-4 rounded-xl bg-cream border border-cocoa/10 mb-4 flex-1">
                      <p className="text-[11px] font-black text-cocoa/40 uppercase tracking-wider mb-1">Latest Check-in</p>
                      <p className="text-sm text-cocoa/70 italic leading-relaxed">
                        &ldquo;{adoption.lastCheckIn || "No updates submitted yet"}&rdquo;
                      </p>
                    </div>

                    {/* ── View journey button ── */}
                    <Link href={`/coach/${adoption.id}`}>
                      <Button
                        variant="outline"
                        className="w-full border-2 border-cocoa text-cocoa font-black text-sm rounded-xl hover:bg-honey/10 shadow-[3px_3px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-0.5 transition-all gap-2 py-4 cursor-pointer"
                      >
                        <Eye className="h-4 w-4" />
                        View Journey & Coach Logs
                      </Button>
                    </Link>
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

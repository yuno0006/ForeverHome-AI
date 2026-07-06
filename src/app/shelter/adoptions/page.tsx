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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cat-dark">Adoptions</h1>
        <p className="mt-1 text-charcoal/50">
          Review adoption applications and monitor active journeys
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 bg-warm-cream p-1 rounded-xl">
          <TabsTrigger
            value="pending"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2"
          >
            <ShieldAlert className="h-4 w-4" />
            Pending Applications
            {pendingRequests.length > 0 && (
              <Badge className="bg-heart text-white h-5 min-w-5 flex items-center justify-center text-[10px] px-1.5">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2"
          >
            <Heart className="h-4 w-4" />
            Active Adoptions
          </TabsTrigger>
        </TabsList>

        {/* ================================================================ */}
        {/* PENDING APPLICATIONS TAB                                         */}
        {/* ================================================================ */}
        <TabsContent value="pending">
          {loadingRequests ? (
            <Card className="bg-white border-sunny/20 rounded-2xl">
              <CardContent className="py-12 text-center">
                <Loader2 className="h-8 w-8 text-sunny animate-spin mx-auto mb-3" />
                <p className="text-sm text-charcoal/50">Loading applications...</p>
              </CardContent>
            </Card>
          ) : pendingRequests.length === 0 ? (
            <Card className="bg-white border-sunny/20 rounded-2xl">
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 text-charcoal/20 mx-auto mb-3" />
                <p className="text-lg font-medium text-cat-dark">No pending applications</p>
                <p className="text-sm text-charcoal/50 mt-1">
                  When adopters submit applications, they&apos;ll appear here for review
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingRequests.map((request) => (
                <Card
                  key={request.id}
                  className="bg-white border-sunny/20 rounded-2xl hover:shadow-md transition-shadow"
                >
                  <CardContent className="pt-5 pb-5">
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Left: Cat info */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="h-16 w-16 rounded-xl bg-sunny-light flex items-center justify-center shrink-0">
                          <Cat className="h-8 w-8 text-cat-dark/40" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-bold text-cat-dark">
                              {request.catName}
                            </h3>
                            <Badge
                              className={`text-[10px] font-semibold border ${
                                compatibilityColors[request.compatibilityLevel]
                              }`}
                            >
                              {compatibilityLabels[request.compatibilityLevel]}
                            </Badge>
                          </div>
                          <p className="text-sm text-charcoal/60 mt-1">
                            Applicant:{" "}
                            <span className="font-medium text-cat-dark">
                              {request.adopterName}
                            </span>
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-charcoal/50">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {request.adopterEmail}
                            </span>
                            {request.adopterPhone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {request.adopterPhone}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(request.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 lg:flex-col lg:items-stretch shrink-0">
                        <Button
                          size="sm"
                          className="bg-heart hover:bg-heart/90 text-white rounded-xl font-semibold gap-1.5 h-9"
                          onClick={() => handleAction(request.id, "approve")}
                          disabled={actionLoading === request.id}
                        >
                          {actionLoading === request.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3.5 w-3.5" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-charcoal/15 text-charcoal/60 hover:text-red-600 hover:border-red-200 rounded-xl gap-1.5 h-9"
                          onClick={() => handleAction(request.id, "reject")}
                          disabled={actionLoading === request.id}
                        >
                          <XCircle className="h-3.5 w-3.5" />
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
        <TabsContent value="active">
          {demoActiveAdoptions.length === 0 ? (
            <Card className="bg-white border-sunny/20 rounded-2xl">
              <CardContent className="py-12 text-center">
                <Heart className="h-12 w-12 text-charcoal/20 mx-auto mb-3" />
                <p className="text-lg font-medium text-cat-dark">No active adoptions</p>
                <p className="text-sm text-charcoal/50 mt-1">
                  When cats are adopted, their 14-day journey will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5">
              {demoActiveAdoptions.map((adoption) => (
                <Card
                  key={adoption.id}
                  className="bg-white border-sunny/20 rounded-2xl hover:shadow-md transition-shadow"
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Cat Photo Placeholder */}
                      <div className="h-24 w-24 rounded-xl bg-sunny-light flex items-center justify-center shrink-0">
                        {adoption.catPhoto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={adoption.catPhoto}
                            alt={adoption.catName}
                            className="h-24 w-24 rounded-xl object-cover"
                          />
                        ) : (
                          <Cat className="h-10 w-10 text-cat-dark/40" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-bold text-cat-dark">{adoption.catName}</h3>
                            <p className="text-sm text-charcoal/50">
                              Adopted by{" "}
                              <span className="font-medium text-cat-dark">
                                {adoption.adopterName}
                              </span>
                            </p>
                          </div>
                          <Badge className="bg-sunny/20 text-cat-dark shrink-0">
                            <Calendar className="h-3 w-3 mr-1" />
                            Day {adoption.currentDay}
                          </Badge>
                        </div>

                        {/* Last Check-in */}
                        <div className="mt-3 p-3 rounded-xl bg-warm-cream/50 border border-sunny/10">
                          <div className="flex items-center gap-2 text-sm">
                            <Activity className="h-4 w-4 text-sunny" />
                            <span className="text-charcoal/60 font-medium">Last check-in:</span>
                          </div>
                          <p className="mt-1 text-sm text-cat-dark">{adoption.lastCheckIn}</p>
                        </div>

                        {/* Action */}
                        <div className="mt-3">
                          <Link href={`/coach/${adoption.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-sunny/20 text-cat-dark rounded-xl hover:bg-sunny-light"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View Timeline
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

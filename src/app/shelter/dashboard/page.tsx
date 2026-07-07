"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cat, Heart, AlertTriangle, ClipboardList, ArrowRight } from "lucide-react";

export default function ShelterDashboardPage() {
  const { userDoc } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);

  useEffect(() => {
    async function fetchPendingCount() {
      try {
        const res = await fetch("/api/adoption-requests?status=pending");
        if (res.ok) {
          const data = await res.json();
          setPendingCount(data.requests?.length || 0);
        }
      } catch {
        // keep default 0
      } finally {
        setLoadingCount(false);
      }
    }
    fetchPendingCount();
  }, []);

  const summaryCards = [
    { label: "Active Cats", count: 3, icon: Cat, color: "text-sunny" },
    { label: "Active Adoptions", count: 2, icon: Heart, color: "text-heart" },
    { label: "Cats Needing Attention", count: 1, icon: AlertTriangle, color: "text-orange-500" },
    {
      label: "Pending Reviews",
      count: loadingCount ? "..." : pendingCount,
      icon: ClipboardList,
      color: pendingCount > 0 ? "text-heart" : "text-charcoal/50",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      text: pendingCount > 0
        ? `${pendingCount} adoption application${pendingCount > 1 ? "s" : ""} awaiting review`
        : "No pending adoption applications",
      time: "View in Adoptions tab",
      link: "/shelter/adoptions",
    },
    { id: 2, text: "Barnaby's behavioral assessment updated by Dr. Chen.", time: "5 hours ago" },
    { id: 3, text: "New cat profile created: Milo (1yr, male).", time: "1 day ago" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-black text-cocoa tracking-tight leading-tight">
          Welcome back,{" "}
          <span className="text-gradient-warm italic">{userDoc?.displayName || "Staff"}</span>
        </h1>
        <p className="text-sm text-cocoa/50 font-medium mt-2">
          Here&apos;s what&apos;s happening at your shelter today.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {summaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="rounded-[1.25rem] border-2 border-cocoa/10 shadow-[4px_4px_0px_0px_rgba(42,29,20,0.05)] hover:shadow-[6px_6px_0px_0px_rgba(42,29,20,1)] transition-all duration-300 overflow-hidden bg-white hover:-translate-y-0.5">
              <CardContent className="flex flex-col gap-3 p-5">
                <div className={`p-2.5 rounded-xl self-start shadow-inner ${idx === 0 ? "bg-sunny/20" : idx === 1 ? "bg-coral/20" : idx === 2 ? "bg-orange-500/20" : "bg-lavender/20"}`}>
                  <Icon className={`size-5 ${idx === 0 ? "text-sunny-deep" : idx === 1 ? "text-coral-deep" : idx === 2 ? "text-orange-600" : "text-lavender-deep"}`} />
                </div>
                <div className="space-y-0.5">
                  <p className="font-display text-3xl font-black text-cocoa leading-none">{card.count}</p>
                  <p className="text-xs font-bold text-cocoa/50">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card className="rounded-[1.25rem] border-2 border-cocoa/10 shadow-[4px_4px_0px_0px_rgba(42,29,20,0.05)] bg-white overflow-hidden mt-8">
        <CardHeader className="bg-cream/50 border-b-2 border-cocoa/10 px-6 py-4">
          <CardTitle className="font-display text-xl font-black text-cocoa">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y-2 divide-cocoa/5">
            {recentActivity.map((item, i) => (
              <div
                key={item.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-cream/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sunny/20 to-coral/10 border-2 border-cocoa/10 flex items-center justify-center shrink-0">
                  <span className="font-black text-cocoa/50 text-[11px]">0{i+1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-cocoa truncate">{item.text}</p>
                  <p className="text-xs font-bold text-cocoa/40 mt-0.5">{item.time}</p>
                </div>
                {item.link && (
                  <Link href={item.link} className="shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-2 border-cocoa text-cocoa font-bold rounded-lg hover:bg-honey/15 shadow-[2px_2px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-0.5 transition-all text-xs px-3 py-1.5 h-auto"
                    >
                      Review
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

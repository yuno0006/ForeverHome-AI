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
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="mb-10">
        <h1 className="font-display text-4xl sm:text-5xl font-black text-cocoa tracking-tight leading-none">
          Welcome back,<br />
          <span className="text-gradient-warm italic">{userDoc?.displayName || "Staff"}</span>
        </h1>
        <p className="text-base text-cocoa/60 font-medium mt-3">
          Here&apos;s what&apos;s happening at your shelter today.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="rounded-[2rem] border-2 border-cocoa/10 shadow-[6px_6px_0px_0px_rgba(42,29,20,0.05)] hover:shadow-[8px_8px_0px_0px_rgba(42,29,20,1)] transition-all duration-300 overflow-hidden bg-white hover:-translate-y-1">
              <CardContent className="flex flex-col gap-4 p-6 sm:p-8">
                <div className={`p-4 rounded-[1.5rem] self-start shadow-inner ${idx === 0 ? "bg-sunny/20" : idx === 1 ? "bg-coral/20" : idx === 2 ? "bg-orange-500/20" : "bg-lavender/20"}`}>
                  <Icon className={`size-7 ${idx === 0 ? "text-sunny-deep" : idx === 1 ? "text-coral-deep" : idx === 2 ? "text-orange-600" : "text-lavender-deep"}`} />
                </div>
                <div className="space-y-1 mt-2">
                  <p className="font-display text-4xl font-black text-cocoa leading-none">{card.count}</p>
                  <p className="text-sm font-bold text-cocoa/60">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card className="rounded-[2rem] border-2 border-cocoa/10 shadow-[6px_6px_0px_0px_rgba(42,29,20,0.05)] bg-white overflow-hidden mt-10">
        <CardHeader className="bg-cream/50 border-b-2 border-cocoa/10 px-8 py-6">
          <CardTitle className="font-display text-2xl font-black text-cocoa">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y-2 divide-cocoa/5">
            {recentActivity.map((item, i) => (
              <div
                key={item.id}
                className="flex items-center gap-6 px-8 py-6 hover:bg-cream/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-[1rem] bg-gradient-to-br from-sunny/20 to-coral/10 border-2 border-cocoa/10 flex items-center justify-center shrink-0">
                  <span className="font-black text-cocoa/50 text-xs">0{i+1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-cocoa">{item.text}</p>
                  <p className="text-sm font-bold text-cocoa/50 mt-1">{item.time}</p>
                </div>
                {item.link && (
                  <Link href={item.link}>
                    <Button
                      variant="outline"
                      className="border-2 border-cocoa text-cocoa font-bold rounded-xl hover:bg-honey/15 shadow-[2px_2px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-0.5 transition-all"
                    >
                      Review
                      <ArrowRight className="h-4 w-4 ml-2" />
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

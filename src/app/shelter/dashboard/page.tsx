"use client";

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cat, Heart, AlertTriangle, ClipboardList } from "lucide-react";

const summaryCards = [
  { label: "Active Cats", count: 3, icon: Cat, color: "text-sunny" },
  { label: "Active Adoptions", count: 2, icon: Heart, color: "text-heart" },
  { label: "Cats Needing Attention", count: 1, icon: AlertTriangle, color: "text-orange-500" },
  { label: "Pending Reviews", count: 0, icon: ClipboardList, color: "text-charcoal/50" },
];

const recentActivity = [
  { id: 1, text: "Luna's adoption application received from Sarah M.", time: "2 hours ago" },
  { id: 2, text: "Barnaby's behavioral assessment updated by Dr. Chen.", time: "5 hours ago" },
  { id: 3, text: "New cat profile created: Milo (1yr, male).", time: "1 day ago" },
];

export default function ShelterDashboardPage() {
  const { userDoc } = useAuth();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-cat-dark">
          Welcome back, {userDoc?.displayName || "Staff"}
        </h1>
        <p className="text-sm text-charcoal/60 mt-1">
          Here's what's happening at your shelter today.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="rounded-2xl">
              <CardContent className="flex items-center gap-4 pt-4">
                <div className={`p-2.5 rounded-xl bg-sunny-light`}>
                  <Icon className={`size-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-cat-dark">{card.count}</p>
                  <p className="text-xs text-charcoal/60">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-cat-dark">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 pb-3 border-b border-sunny/10 last:border-0 last:pb-0"
              >
                <div className="w-2 h-2 rounded-full bg-sunny mt-2 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-cat-dark">{item.text}</p>
                  <p className="text-xs text-charcoal/50 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

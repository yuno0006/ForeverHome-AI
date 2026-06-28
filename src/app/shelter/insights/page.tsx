"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Calendar, AlertTriangle, BarChart3, Activity, Cat } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <Card className="bg-white border-sunny/20 rounded-2xl">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center gap-3">
          <div className="bg-sunny-light rounded-full p-2.5">{icon}</div>
          <div>
            <p className="text-2xl font-bold text-cat-dark">{value}</p>
            <p className="text-xs text-charcoal/50">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Demo data
const insights = {
  activeAdoptions: 12,
  averageTimeToAdoption: 18,
  highConcernsReviewed: 14,
  adopterSatisfaction: 4.6,
  catsNeedingAttention: [
    { catId: "barnaby", catName: "Barnaby", day: 3, reason: "Still hiding (stress-sensitive cat)" },
    { catId: "milo", catName: "Milo", day: 7, reason: "No play reported (high energy, concern)" },
  ],
  commonConcerns: [
    { description: "High stress sensitivity + household noise", count: 8 },
    { description: "High energy + long work hours", count: 6 },
    { description: "Not comfortable with children + young kids", count: 4 },
  ],
};

export default function ShelterInsightsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cat-dark">Shelter Insights</h1>
        <p className="mt-1 text-charcoal/50">
          A practical overview of adoption patterns and cats needing attention.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Active Adoptions"
          value={insights.activeAdoptions}
          icon={<Heart className="h-5 w-5 text-heart" />}
        />
        <StatCard
          label="Avg. Time to Adoption"
          value={`${insights.averageTimeToAdoption} days`}
          icon={<Calendar className="h-5 w-5 text-cat-dark" />}
        />
        <StatCard
          label="High Concerns Reviewed"
          value={insights.highConcernsReviewed}
          icon={<AlertTriangle className="h-5 w-5 text-risk-high" />}
        />
        <StatCard
          label="Adopter Satisfaction"
          value={`${insights.adopterSatisfaction} / 5.0`}
          icon={<BarChart3 className="h-5 w-5 text-sunny" />}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cats Needing Attention */}
        <Card className="bg-white border-sunny/20 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-cat-dark flex items-center gap-2">
              <Activity className="h-5 w-5 text-heart" />
              Cats Needing Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.catsNeedingAttention.length === 0 ? (
              <div className="text-center py-6">
                <Cat className="h-10 w-10 text-charcoal/20 mx-auto mb-2" />
                <p className="text-charcoal/50 text-sm">All cats are doing well!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {insights.catsNeedingAttention.map((cat) => (
                  <div
                    key={cat.catId}
                    className="p-3 rounded-xl border border-heart/10 bg-heart/5"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-cat-dark">{cat.catName}</span>
                      <Badge className="bg-sunny/20 text-cat-dark text-xs">
                        Day {cat.day}
                      </Badge>
                    </div>
                    <p className="text-sm text-charcoal/60">{cat.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Common Concerns */}
        <Card className="bg-white border-sunny/20 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-cat-dark flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-risk-moderate" />
              Common Compatibility Concerns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.commonConcerns.map((concern, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl border border-sunny/10 bg-warm-cream/30"
                >
                  <p className="text-sm text-cat-dark flex-1">{concern.description}</p>
                  <Badge className="bg-sunny/20 text-cat-dark ml-3 shrink-0">
                    {concern.count}x
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

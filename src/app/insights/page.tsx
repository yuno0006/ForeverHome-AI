import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Calendar, ShieldCheck, Star } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <Card className="border-border bg-white">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center gap-3">
          <div className="bg-sunny/10 rounded-full p-2">{icon}</div>
          <div>
            <p className="text-2xl font-bold text-cat-dark">{value}</p>
            <p className="text-xs text-charcoal/50">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { calculateInsights } from "@/lib/insightsCalculator";
import CatsNeedingAttention from "@/components/insights/CatsNeedingAttention";
import CommonConcernsList from "@/components/insights/CommonConcernsList";

export default function InsightsPage() {
  const insights = calculateInsights();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-cat-dark">
          Shelter Insights
        </h1>
        <p className="mt-2 text-charcoal/50">
          A practical overview of adoption patterns and cats needing attention.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Active Adoptions"
          value={insights.activeAdoptions}
          icon={<Heart className="h-5 w-5 text-cat-dark" />}
        />
        <StatCard
          label="Avg. Time to Adoption"
          value={`${insights.averageTimeToAdoption} days`}
          icon={<Calendar className="h-5 w-5 text-cat-dark" />}
        />
        <StatCard
          label="High Concerns Reviewed"
          value={insights.highConcernsReviewed}
          icon={<ShieldCheck className="h-5 w-5 text-cat-dark" />}
        />
        <StatCard
          label="Adopter Satisfaction"
          value={`${insights.adopterSatisfaction} / 5.0`}
          icon={<Star className="h-5 w-5 text-cat-dark" />}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <CatsNeedingAttention cats={insights.catsNeedingAttention} />
        <CommonConcernsList concerns={insights.commonConcerns} />
      </div>
    </div>
  );
}

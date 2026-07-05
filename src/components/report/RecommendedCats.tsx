import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cat } from "@/types/cat";
import { CompatibilityResult } from "@/types/match";
import { ArrowRight, Sparkles } from "lucide-react";

interface Recommendation {
  cat: Cat;
  result: CompatibilityResult;
}

interface RecommendedCatsProps {
  recommendations: Recommendation[];
  currentCatName: string;
}

const levelStyles: Record<CompatibilityResult["level"], { badge: string; label: string }> = {
  low: { badge: "bg-green-500 text-white", label: "Great match" },
  moderate: { badge: "bg-risk-moderate/10 text-risk-moderate", label: "Good with care" },
  high: { badge: "bg-risk-high/10 text-risk-high", label: "Needs review" },
};

export default function RecommendedCats({ recommendations, currentCatName }: RecommendedCatsProps) {
  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-lavender" />
        <h3 className="font-semibold text-cat-dark text-lg">
          AI-recommended matches for you
        </h3>
      </div>
      <p className="text-sm text-charcoal/50">
        Based on the same lifestyle and scenario answers you gave for {currentCatName}, here&apos;s how you&apos;d match with other available cats.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {recommendations.map(({ cat, result }) => (
          <Link key={cat.id} href={`/assessment/${cat.id}`}>
            <Card className="border-border hover:shadow-md transition-shadow cursor-pointer bg-white">
              <CardContent className="pt-4 pb-4 flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.photo}
                  alt={cat.name}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-cat-dark">{cat.name}</p>
                    <Badge className={levelStyles[result.level].badge}>
                      {levelStyles[result.level].label}
                    </Badge>
                  </div>
                  <p className="text-xs text-charcoal/50 mt-0.5">
                    {cat.age} {cat.age === 1 ? "yr" : "yrs"} · {cat.behavior.energy} energy · {cat.behavior.sociability}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-heart flex-shrink-0" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommonConcern } from "@/types/insights";
import { BarChart3 } from "lucide-react";

interface CommonConcernsListProps {
  concerns: CommonConcern[];
}

export default function CommonConcernsList({ concerns }: CommonConcernsListProps) {
  const maxCount = Math.max(...concerns.map((c) => c.count));

  return (
    <Card className="border-border bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-cat-dark flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-cat-dark" />
          Common Compatibility Concerns (Last 30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {concerns.map((concern, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-foreground">{concern.description}</span>
              <span className="text-charcoal/50 font-medium">
                ({concern.count})
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-sunny/60 rounded-full transition-all"
                style={{ width: `${(concern.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

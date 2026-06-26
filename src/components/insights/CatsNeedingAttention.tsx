import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CatAttention } from "@/types/insights";
import { AlertTriangle } from "lucide-react";

interface CatsNeedingAttentionProps {
  cats: CatAttention[];
}

export default function CatsNeedingAttention({ cats }: CatsNeedingAttentionProps) {
  return (
    <Card className="border-border bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-cat-dark flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-risk-moderate" />
          Cats Needing Attention
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {cats.map((cat) => (
          <div
            key={cat.catId}
            className="flex items-start gap-3 p-3 rounded-lg bg-risk-moderate/5 border border-risk-moderate/20"
          >
            <div className="w-2 h-2 rounded-full bg-risk-moderate mt-2 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {cat.catName} — Day {cat.day}
              </p>
              <p className="text-xs text-charcoal/50">{cat.reason}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

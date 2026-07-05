import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { demoCats } from "@/data/demoCats";
import { ArrowRight } from "lucide-react";

interface AlternativeCatsProps {
  catIds: string[];
}

export default function AlternativeCats({ catIds }: AlternativeCatsProps) {
  if (catIds.length === 0) return null;

  const cats = catIds
    .map((id) => demoCats.find((c) => c.id === id))
    .filter(Boolean);

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-cat-dark text-lg">
        You might also consider
      </h3>
      <p className="text-sm text-charcoal/50">
        Based on your answers, these cats may be a better fit for your home.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {cats.map(
          (cat) =>
            cat && (
              <Link key={cat.id} href={`/cats/${cat.id}`}>
                <Card className="border-border hover:shadow-md transition-shadow cursor-pointer bg-white">
                  <CardContent className="pt-4 pb-4 flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cat.photo}
                      alt={cat.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-cat-dark">{cat.name}</p>
                      <p className="text-xs text-charcoal/50">
                        {cat.age} years old · {cat.behavior.energy} energy ·{" "}
                        {cat.behavior.sociability}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-heart" />
                  </CardContent>
                </Card>
              </Link>
            )
        )}
      </div>
    </div>
  );
}

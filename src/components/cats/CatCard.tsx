import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cat } from "@/types/cat";
import { Zap, Heart, Sparkles } from "lucide-react";

interface CatCardProps {
  cat: Cat;
}

const energyLabels: Record<string, string> = {
  low: "Calm",
  medium: "Moderate",
  high: "Energetic",
};

const sociabilityLabels: Record<string, string> = {
  reserved: "Quiet",
  moderate: "Balanced",
  outgoing: "Social",
};

export default function CatCard({ cat }: CatCardProps) {
  return (
    <Link href={`/assessment/${cat.id}`}>
      <Card className="overflow-hidden border-sunny/20 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group bg-white rounded-2xl">
        <div className="relative h-52 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cat.photo}
            alt={cat.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-sunny text-cat-dark font-semibold rounded-full px-3">
              {cat.status}
            </Badge>
          </div>
          {cat.care.knownMedicalNeeds !== "None" && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-heart/90 text-white rounded-full px-2.5 text-xs">
                <Heart className="h-3 w-3 mr-1" /> Needs care
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="pt-4 pb-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-cat-dark">{cat.name}</h3>
            <span className="text-sm text-charcoal/50 font-medium">
              {cat.age} {cat.lifeStage === "kitten" ? "mo" : "yr"}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            <Badge variant="secondary" className="gap-1 rounded-full bg-sunny-light text-cat-dark">
              <Zap className="h-3 w-3 text-sunny" />
              {energyLabels[cat.behavior.energy]}
            </Badge>
            <Badge variant="secondary" className="gap-1 rounded-full bg-sunny-light text-cat-dark">
              <Sparkles className="h-3 w-3 text-sunny" />
              {sociabilityLabels[cat.behavior.sociability]}
            </Badge>
            {cat.behavior.stressSensitivity === "high" && (
              <Badge variant="secondary" className="gap-1 rounded-full bg-heart-light text-heart">
                Sensitive
              </Badge>
            )}
          </div>

          <p className="text-sm text-charcoal/50 line-clamp-2 leading-relaxed">
            {cat.care.specialNotes}
          </p>

          <p className="mt-3 text-sm font-semibold text-heart group-hover:text-heart/80 transition-colors">
            Meet {cat.name} →
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

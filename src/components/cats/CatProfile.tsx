import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Cat } from "@/types/cat";
import {
  Zap,
  Users,
  Volume2,
  Mountain,
  Baby,
  Cat as CatIcon,
  Dog,
  Hand,
  Activity,
  Home,
} from "lucide-react";

interface CatProfileProps {
  cat: Cat;
}

export default function CatProfile({ cat }: CatProfileProps) {
  return (
    <Card className="border-border bg-white shadow-sm overflow-hidden">
      {/* Cat Photo — big and properly fitted */}
      <div className="relative h-56 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cat.photo}
          alt={cat.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-2xl font-bold text-white drop-shadow-lg">{cat.name}</h3>
          <p className="text-sm text-white/80 drop-shadow font-semibold">
            {cat.breed} · {cat.age} {cat.lifeStage === "kitten" ? "mo" : "yrs"} · {cat.sex}
          </p>
        </div>
      </div>
      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-charcoal/50">Age:</span>{" "}
            <span className="font-medium">
              {cat.age} {cat.lifeStage === "kitten" ? "months" : "years"}
            </span>
          </div>
          <div>
            <span className="text-charcoal/50">Sex:</span>{" "}
            <span className="font-medium capitalize">{cat.sex}</span>
          </div>
          <div>
            <span className="text-charcoal/50">Neutered:</span>{" "}
            <span className="font-medium">
              {cat.neutered ? "Yes" : "No"}
            </span>
          </div>
          <div>
            <span className="text-charcoal/50">FIV:</span>{" "}
            <Badge variant="secondary" className="text-risk-low">
              {cat.care.fivStatus}
            </Badge>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold text-cat-dark mb-3">Behavioral Profile</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-charcoal/50" />
              <span>Energy: <strong className="capitalize">{cat.behavior.energy}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-charcoal/50" />
              <span>Sociability: <strong className="capitalize">{cat.behavior.sociability}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-charcoal/50" />
              <span>Stress: <strong className="capitalize">{cat.behavior.stressSensitivity}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Hand className="h-4 w-4 text-charcoal/50" />
              <span>Handling: <strong className="capitalize">{cat.behavior.handlingTolerance}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-charcoal/50" />
              <span>Noise tolerance: <strong className="capitalize">{cat.behavior.noiseTolerance}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Mountain className="h-4 w-4 text-charcoal/50" />
              <span>Vertical space: <strong className="capitalize">{cat.behavior.needsVerticalSpace}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Baby className="h-4 w-4 text-charcoal/50" />
              <span>Children: <strong className="capitalize">{cat.behavior.comfortableWithChildren}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <CatIcon className="h-4 w-4 text-charcoal/50" />
              <span>Other cats: <strong className="capitalize">{cat.behavior.comfortableWithCats}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Dog className="h-4 w-4 text-charcoal/50" />
              <span>Dogs: <strong className="capitalize">{cat.behavior.comfortableWithDogs}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-charcoal/50" />
              <span>Indoor only: <strong>{cat.behavior.indoorOnlyRequired ? "Yes" : "No"}</strong></span>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold text-cat-dark mb-2">Special Notes</h4>
          <p className="text-sm text-charcoal/50">{cat.care.specialNotes}</p>
        </div>
      </CardContent>
    </Card>
  );
}

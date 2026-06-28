"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Cat, Calendar, Eye, Activity } from "lucide-react";

interface ActiveAdoption {
  id: string;
  catName: string;
  catPhoto: string | null;
  adopterName: string;
  currentDay: number;
  lastCheckIn: string;
}

const demoAdoptions: ActiveAdoption[] = [
  {
    id: "adoption-1",
    catName: "Barnaby",
    catPhoto: null,
    adopterName: "Margaret",
    currentDay: 3,
    lastCheckIn: "Came out for treats",
  },
  {
    id: "adoption-2",
    catName: "Luna",
    catPhoto: null,
    adopterName: "Sarah",
    currentDay: 7,
    lastCheckIn: "Playing with feather toy",
  },
];

export default function ShelterAdoptionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cat-dark">Active Adoptions</h1>
        <p className="mt-1 text-charcoal/50">Monitor ongoing adoption journeys</p>
      </div>

      {demoAdoptions.length === 0 ? (
        <Card className="bg-white border-sunny/20 rounded-2xl">
          <CardContent className="py-12 text-center">
            <Heart className="h-12 w-12 text-charcoal/20 mx-auto mb-3" />
            <p className="text-lg font-medium text-cat-dark">No active adoptions</p>
            <p className="text-sm text-charcoal/50 mt-1">
              When cats are adopted, their journey will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5">
          {demoAdoptions.map((adoption) => (
            <Card
              key={adoption.id}
              className="bg-white border-sunny/20 rounded-2xl hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Cat Photo Placeholder */}
                  <div className="h-24 w-24 rounded-xl bg-sunny-light flex items-center justify-center shrink-0">
                    {adoption.catPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={adoption.catPhoto}
                        alt={adoption.catName}
                        className="h-24 w-24 rounded-xl object-cover"
                      />
                    ) : (
                      <Cat className="h-10 w-10 text-cat-dark/40" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-cat-dark">{adoption.catName}</h3>
                        <p className="text-sm text-charcoal/50">
                          Adopted by <span className="font-medium text-cat-dark">{adoption.adopterName}</span>
                        </p>
                      </div>
                      <Badge className="bg-sunny/20 text-cat-dark shrink-0">
                        <Calendar className="h-3 w-3 mr-1" />
                        Day {adoption.currentDay}
                      </Badge>
                    </div>

                    {/* Last Check-in */}
                    <div className="mt-3 p-3 rounded-xl bg-warm-cream/50 border border-sunny/10">
                      <div className="flex items-center gap-2 text-sm">
                        <Activity className="h-4 w-4 text-sunny" />
                        <span className="text-charcoal/60 font-medium">Last check-in:</span>
                      </div>
                      <p className="mt-1 text-sm text-cat-dark">{adoption.lastCheckIn}</p>
                    </div>

                    {/* Action */}
                    <div className="mt-3">
                      <Link href={`/coach/${adoption.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-sunny/20 text-cat-dark rounded-xl hover:bg-sunny-light"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Timeline
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

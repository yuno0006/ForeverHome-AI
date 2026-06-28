"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Cat, Calendar, Eye, AlertTriangle, Activity } from "lucide-react";

interface Assessment {
  id: string;
  catName: string;
  date: string;
  riskLevel: "high" | "moderate" | "low";
}

interface Adoption {
  id: string;
  catName: string;
  currentDay: number;
}

const demoAssessments: Assessment[] = [
  { id: "assess-1", catName: "Barnaby", date: "Jun 20, 2024", riskLevel: "high" },
  { id: "assess-2", catName: "Luna", date: "Jun 18, 2024", riskLevel: "low" },
];

const demoAdoptions: Adoption[] = [
  { id: "adoption-1", catName: "Barnaby", currentDay: 3 },
];

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const { userDoc } = useAuth();
  const displayName = userDoc?.displayName || "there";
  const hasAssessments = demoAssessments.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cat-dark">
          Hey, {displayName} <span className="inline-block animate-bounce">👋</span>
        </h1>
        <p className="mt-1 text-charcoal/50">Welcome back to your adoption dashboard</p>
      </div>

      {/* First-time banner */}
      {!hasAssessments && (
        <Card className="bg-sunny-light border-sunny/20 rounded-2xl mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Heart className="h-6 w-6 text-heart mt-0.5 shrink-0" />
              <div>
                <h2 className="font-bold text-cat-dark text-lg">Welcome to ForeverHome AI!</h2>
                <p className="text-sm text-charcoal/60 mt-1">
                  Here&apos;s how it works: Browse available cats, run a compatibility assessment
                  to see how well you match, and if you adopt, our AI coach will guide you through
                  the first 14 days together.
                </p>
                <Link href="/cats">
                  <Button className="mt-3 bg-sunny hover:bg-sunny/90 text-cat-dark font-semibold rounded-xl">
                    <Cat className="h-4 w-4 mr-2" />
                    Browse Cats
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Assessments */}
      {hasAssessments && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-cat-dark mb-4">My Assessments</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {demoAssessments.map((assessment) => (
              <Card
                key={assessment.id}
                className="bg-white border-sunny/20 rounded-2xl hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-cat-dark">{assessment.catName}</h3>
                    <Badge
                      className={
                        assessment.riskLevel === "high"
                          ? "bg-risk-high/10 text-risk-high"
                          : assessment.riskLevel === "moderate"
                          ? "bg-risk-moderate/10 text-risk-moderate"
                          : "bg-risk-low/10 text-risk-low"
                      }
                    >
                      {assessment.riskLevel === "high" && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {assessment.riskLevel.charAt(0).toUpperCase() + assessment.riskLevel.slice(1)} Risk
                    </Badge>
                  </div>
                  <p className="text-sm text-charcoal/50 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {assessment.date}
                  </p>
                  <Link href={`/assessment/${assessment.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full border-sunny/20 text-cat-dark rounded-xl hover:bg-sunny-light"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Report
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Active Adoptions */}
      {demoAdoptions.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-cat-dark mb-4">Active Adoptions</h2>
          <div className="grid gap-4">
            {demoAdoptions.map((adoption) => (
              <Card
                key={adoption.id}
                className="bg-white border-sunny/20 rounded-2xl hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-sunny-light flex items-center justify-center">
                        <Cat className="h-5 w-5 text-cat-dark" />
                      </div>
                      <div>
                        <h3 className="font-bold text-cat-dark">{adoption.catName}</h3>
                        <p className="text-sm text-charcoal/50 flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          Day {adoption.currentDay} of your journey
                        </p>
                      </div>
                    </div>
                    <Link href={`/coach/${adoption.id}`}>
                      <Button className="bg-sunny hover:bg-sunny/90 text-cat-dark font-semibold rounded-xl">
                        Open Coach
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* CTA Card */}
      <Card className="bg-sunny/10 border-sunny/20 rounded-2xl">
        <CardContent className="pt-6 pb-6">
          <div className="text-center">
            <Cat className="h-10 w-10 text-sunny mx-auto mb-3" />
            <h3 className="text-lg font-bold text-cat-dark">Find your next match</h3>
            <p className="text-sm text-charcoal/50 mt-1 mb-4">
              Browse available cats and discover your perfect companion
            </p>
            <Link href="/cats">
              <Button className="bg-sunny hover:bg-sunny/90 text-cat-dark font-semibold rounded-xl px-8">
                <Heart className="h-4 w-4 mr-2" />
                Browse Cats
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

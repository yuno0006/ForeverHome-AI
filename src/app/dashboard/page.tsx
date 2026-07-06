"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Cat, Calendar, Eye, AlertTriangle, Activity, AlertCircle, CheckCircle, User, Settings, Star, Loader2, Gamepad2 } from "lucide-react";
import { UserRole } from "@/types/user";
import { fetchUserAssessments } from "@/lib/firestoreService";
import { getCatById } from "@/data/demoCats";

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

const recommendationToRisk: Record<string, "high" | "moderate" | "low"> = {
  "not-recommended": "high",
  fair: "moderate",
  good: "moderate",
  excellent: "low",
};

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const { user, userDoc, refreshUserDoc } = useAuth();
  const displayName = userDoc?.displayName || "there";

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [assessmentsLoading, setAssessmentsLoading] = useState(true);
  const [activeAdoptions, setActiveAdoptions] = useState<Adoption[]>([]);
  const [adoptionsLoading, setAdoptionsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchUserAssessments(user.uid)
      .then((records) => {
        const mapped: Assessment[] = records.map((record) => {
          const cat = getCatById(record.catId);
          const createdAt = record.createdAt?.toDate
            ? record.createdAt.toDate()
            : new Date();
          return {
            id: record.id,
            catName: cat?.name || record.catId,
            date: createdAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            riskLevel: recommendationToRisk[record.compatibilityResult.recommendation] || "moderate",
          };
        });
        setAssessments(mapped);
      })
      .catch((err) => {
        console.error("Failed to load assessments:", err);
        setAssessments([]);
      })
      .finally(() => setAssessmentsLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    async function loadAdoptions() {
      setAdoptionsLoading(true);
      const USE_FIRESTORE = process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== undefined;
      if (USE_FIRESTORE) {
        try {
          const { collection, query, where, getDocs } = await import("firebase/firestore");
          const { db } = await import("@/lib/firebase");
          const q = query(collection(db, "activeAdoptions"), where("adopterUid", "==", uid));
          const snap = await getDocs(q);
          const list: Adoption[] = [];
          snap.forEach((doc) => {
            const data = doc.data();
            list.push({
              id: doc.id,
              catName: data.catName || "Unknown Cat",
              currentDay: data.currentDay || 1,
            });
          });
          setActiveAdoptions(list);
        } catch (err) {
          console.error("Failed to load active adoptions:", err);
        }
      } else {
        const stored = JSON.parse(sessionStorage.getItem("activeAdoptions") || "[]");
        // Filter by adopterUid if available, else show all in local demo
        const list = stored
          .filter((item: any) => !item.adopterUid || item.adopterUid === uid)
          .map((item: any) => ({
            id: item.id,
            catName: item.catName,
            currentDay: item.currentDay || 1,
          }));
        setActiveAdoptions(list);
      }
      setAdoptionsLoading(false);
    }
    loadAdoptions();
  }, [user]);

  const hasAssessments = assessments.length > 0;
  
  // Profile completion status
  const hasAdopterProfile = userDoc?.hasAdopterProfile ?? false;
  
  // Multi-role support - check if user has both roles
  const userRoles = userDoc?.roles ?? [];
  const activeRole = userDoc?.activeRole ?? userDoc?.role ?? null;
  const hasMultipleRoles = userRoles.length > 1;
  
  // Role toggle handler
  const handleRoleToggle = async (newRole: UserRole) => {
    if (!userDoc || newRole === activeRole) return;
    
    try {
      const { updateUserDocument } = await import("@/lib/auth");
      await updateUserDocument(userDoc.uid, { activeRole: newRole });
      await refreshUserDoc();
    } catch (error) {
      console.error("Failed to toggle role:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cat-dark">
          Hey, {displayName} <span className="inline-block animate-bounce">👋</span>
        </h1>
        <p className="mt-1 text-charcoal/50">Welcome back to your adoption dashboard</p>
      </div>

      {/* Role Toggle for Multi-Role Users */}
      {hasMultipleRoles && (
        <Card className="bg-white border-sunny/20 rounded-2xl mb-6">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-charcoal/50" />
                <span className="text-sm text-charcoal/70">Switch role:</span>
              </div>
              <div className="flex gap-2">
                {userRoles.includes("adopter") && (
                  <Button
                    variant={activeRole === "adopter" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleRoleToggle("adopter")}
                    className={activeRole === "adopter" 
                      ? "bg-sunny hover:bg-sunny/90 text-cat-dark rounded-xl" 
                      : "border-sunny/20 text-cat-dark rounded-xl hover:bg-sunny-light"}
                  >
                    <User className="h-3 w-3 mr-1" />
                    Adopter
                  </Button>
                )}
                {userRoles.includes("shelter_staff") && (
                  <Button
                    variant={activeRole === "shelter_staff" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleRoleToggle("shelter_staff")}
                    className={activeRole === "shelter_staff" 
                      ? "bg-sunny hover:bg-sunny/90 text-cat-dark rounded-xl" 
                      : "border-sunny/20 text-cat-dark rounded-xl hover:bg-sunny-light"}
                  >
                    <Cat className="h-3 w-3 mr-1" />
                    Shelter Staff
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Completion Status */}
      {!hasAdopterProfile && (
        <Card className="border-heart/20 bg-heart/5 rounded-2xl mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-heart shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-cat-dark">Complete your profile</p>
                <p className="text-sm text-muted-foreground">
                  Help us find your perfect match by filling out your adopter profile.
                </p>
              </div>
              <Link 
                href="/onboarding"
                className="inline-flex items-center justify-center rounded-lg bg-sunny hover:bg-sunny/90 text-cat-dark font-semibold rounded-xl shrink-0 h-8 px-2.5 text-sm"
              >
                Complete Profile
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Complete Indicator */}
      {hasAdopterProfile && (
        <Card className="border-green-200 bg-green-50 rounded-2xl mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-cat-dark">Profile complete</p>
                <p className="text-sm text-muted-foreground">
                  Your adopter profile is set up and ready for assessments.
                </p>
              </div>
              <Link 
                href="/profile"
                className="inline-flex items-center justify-center rounded-lg border border-green-200 text-cat-dark rounded-xl hover:bg-green-100 shrink-0 h-8 px-2.5 text-sm"
              >
                Edit Profile
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* First-time banner */}
      {!assessmentsLoading && !hasAssessments && (
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
      {assessmentsLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-sunny" />
        </div>
      ) : hasAssessments && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-cat-dark mb-4">My Assessments</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {assessments.map((assessment) => (
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
                  <Link href={`/report/${assessment.id}`}>
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
      {adoptionsLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-sunny" />
        </div>
      ) : activeAdoptions.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-cat-dark mb-4">Active Adoptions</h2>
          <div className="grid gap-4">
            {activeAdoptions.map((adoption) => (
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
                    <div className="flex gap-2">
                      <Link href={`/game`}>
                        <Button variant="outline" className="border-sunny/20 text-cat-dark font-semibold rounded-xl hover:bg-sunny-light hidden sm:flex">
                          <Gamepad2 className="w-4 h-4 mr-1 text-sunny" />
                          Play Game
                        </Button>
                      </Link>
                      <Link href={`/shelters/paws-haven`}>
                        <Button variant="outline" className="border-sunny/20 text-cat-dark font-semibold rounded-xl hover:bg-sunny-light hidden sm:flex">
                          <Star className="w-4 h-4 mr-1 text-sunny" />
                          Review Shelter
                        </Button>
                      </Link>
                      <Link href={`/coach/${adoption.id}`}>
                        <Button className="bg-sunny hover:bg-sunny/90 text-cat-dark font-semibold rounded-xl">
                          Open Coach
                        </Button>
                      </Link>
                    </div>
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

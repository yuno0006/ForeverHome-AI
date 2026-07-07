"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Archive, Sparkles, Loader2, Heart } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { fetchCatsByShelter, archiveCat, seedDemoCatsForShelter, CatDocument } from "@/lib/catService";

type DisplayCat = CatDocument;

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    available: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    adopted: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-700"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function EmptyState({ onSeed, seeding }: { onSeed: () => void; seeding: boolean }) {
  return (
    <Card className="rounded-[2rem] border-2 border-cocoa/10 shadow-[6px_6px_0px_0px_rgba(42,29,20,0.05)] bg-white overflow-hidden">
      <CardContent className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-20 h-20 bg-coral/10 border-2 border-coral/20 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm rotate-3">
          <Archive className="size-10 text-coral" />
        </div>
        <h3 className="font-display text-3xl font-black text-cocoa mb-3">No cats yet</h3>
        <p className="text-base text-cocoa/60 font-medium mb-8 max-w-md leading-relaxed">
          Add your first cat profile, or load our 9 demo cats to explore the
          shelter tools right away.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/shelter/cats/new">
            <Button className="cursor-pointer bg-sage text-white hover:bg-sage-deep px-6 py-5 rounded-xl font-bold shadow-[3px_3px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-0.5 transition-all border-2 border-cocoa">
              <Plus className="size-5 mr-2" />
              Add Cat
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={onSeed}
            disabled={seeding}
            className="cursor-pointer border-2 border-cocoa text-cocoa hover:bg-sunny/10 px-6 py-5 rounded-xl font-bold shadow-[3px_3px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-0.5 transition-all"
          >
            {seeding ? (
              <Loader2 className="size-5 mr-2 animate-spin" />
            ) : (
              <Sparkles className="size-5 mr-2 text-sunny-deep" />
            )}
            Load Demo Cats
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="rounded-2xl">
          <CardContent className="flex items-center gap-4 py-4">
            <Skeleton className="w-20 h-20 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-40" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function ShelterCatsPage() {
  const { user, userDoc } = useAuth();
  const [cats, setCats] = useState<DisplayCat[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const shelterId = userDoc?.shelterId;

  const loadCats = async () => {
    if (!shelterId) {
      setCats([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const firestoreCats = await fetchCatsByShelter(shelterId);
      setCats(firestoreCats);
    } catch (error) {
      console.error("Failed to fetch cats:", error);
      setCats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shelterId]);

  const handleSeedDemoCats = async () => {
    if (!shelterId || !user) return;
    setSeeding(true);
    try {
      const count = await seedDemoCatsForShelter(shelterId, user.uid);
      if (count > 0) {
        toast.success(`Added ${count} demo cats to your shelter`);
        await loadCats();
      } else {
        toast.info("Your shelter already has cats");
      }
    } catch (error) {
      console.error("Failed to seed demo cats:", error);
      toast.error("Failed to load demo cats");
    } finally {
      setSeeding(false);
    }
  };

  const handleArchive = async (catId: string) => {
    try {
      await archiveCat(catId);
      setCats((prev) => prev.filter((cat) => cat.id !== catId));
      toast.success("Cat archived successfully");
    } catch (error) {
      console.error("Failed to archive cat:", error);
      toast.error("Failed to archive cat");
    }
  };

  const handleMarkAdopted = async (cat: DisplayCat) => {
    try {
      const { updateCat } = await import("@/lib/catService");
      await updateCat(cat.id, { status: "adopted" });
      setCats((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, status: "adopted" as const } : c))
      );
      toast.success(`${cat.name} marked as adopted! You can now access the 9 Lives Coach.`, {
        action: {
          label: "Open Coach",
          onClick: () => window.location.href = `/coach/${cat.id}-adoption-1`,
        },
      });
    } catch (error) {
      console.error("Failed to mark cat as adopted:", error);
      toast.error("Failed to update cat status");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-cocoa tracking-tight leading-none">Cat Management</h1>
          <p className="text-base text-cocoa/60 font-medium mt-3">Manage profiles and adoption statuses.</p>
        </div>
        <Link href="/shelter/cats/new">
          <Button className="cursor-pointer bg-sage text-white hover:bg-sage-deep px-6 py-5 rounded-xl font-bold shadow-[3px_3px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-0.5 transition-all border-2 border-cocoa">
            <Plus className="size-5 mr-2" />
            Add Cat
          </Button>
        </Link>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : cats.length === 0 ? (
        <EmptyState onSeed={handleSeedDemoCats} seeding={seeding} />
      ) : (
        <div className="grid gap-6">
          {cats.map((cat) => (
            <Card key={cat.id} className="rounded-[2rem] border-2 border-cocoa/15 bg-white hover:shadow-[6px_6px_0px_0px_rgba(42,29,20,1)] transition-all duration-300 overflow-hidden group">
              <CardContent className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 sm:p-8">
                <div className="h-24 w-24 rounded-[1.5rem] border-2 border-cocoa/10 overflow-hidden shrink-0 shadow-sm relative">
                  <img
                    src={cat.photo}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h3 className="font-display text-2xl font-black text-cocoa tracking-tight">{cat.name}</h3>
                    <StatusBadge status={cat.status} />
                  </div>
                  <p className="text-sm font-bold text-cocoa/60">
                    {cat.age} {cat.age === 1 ? "year" : "years"} old &middot; {cat.sex} &middot; {cat.lifeStage}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-4 sm:pt-0">
                  {cat.status === "available" && (
                    <Button
                      variant="outline"
                      className="cursor-pointer border-2 border-cocoa text-sage-deep hover:bg-sage/15 rounded-xl font-bold shadow-[2px_2px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-0.5 transition-all"
                      onClick={() => handleMarkAdopted(cat)}
                      title="Mark as Adopted"
                    >
                      <Heart className="size-4 mr-2" />
                      Adopted
                    </Button>
                  )}
                  {cat.status === "adopted" && (
                    <Link href={`/coach/${cat.id}-adoption-1`}>
                      <Button
                        variant="outline"
                        className="cursor-pointer border-2 border-cocoa text-sunny-deep hover:bg-sunny/15 rounded-xl font-bold shadow-[2px_2px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-0.5 transition-all"
                        title="Open Coach"
                      >
                        <Sparkles className="size-4 mr-2" />
                        Coach
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    className="cursor-pointer border-2 border-cocoa text-cocoa hover:bg-cocoa/5 rounded-xl font-bold shadow-[2px_2px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-0.5 transition-all w-10 h-10"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="cursor-pointer border-2 border-cocoa text-coral hover:bg-coral/10 rounded-xl font-bold shadow-[2px_2px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-0.5 transition-all w-10 h-10"
                    onClick={() => handleArchive(cat.id)}
                  >
                    <Archive className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

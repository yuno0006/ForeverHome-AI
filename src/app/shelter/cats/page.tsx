"use client";

import Link from "next/link";
import { demoCats } from "@/data/demoCats";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Archive } from "lucide-react";

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

function EmptyState() {
  return (
    <Card className="rounded-2xl">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 rounded-full bg-sunny-light mb-4">
          <Archive className="size-8 text-sunny" />
        </div>
        <h3 className="text-lg font-semibold text-cat-dark mb-1">No cats yet</h3>
        <p className="text-sm text-charcoal/60 mb-4">
          Add your first cat profile to get started.
        </p>
        <Link href="/shelter/cats/new">
          <Button className="cursor-pointer bg-sunny hover:bg-sunny/80 text-cat-dark">
            <Plus className="size-4 mr-1" />
            Add Cat
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function ShelterCatsPage() {
  const cats = demoCats;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-cat-dark">Cat Management</h1>
        <Link href="/shelter/cats/new">
          <Button className="cursor-pointer bg-sunny hover:bg-sunny/80 text-cat-dark">
            <Plus className="size-4 mr-1" />
            Add Cat
          </Button>
        </Link>
      </div>

      {cats.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4">
          {cats.map((cat) => (
            <Card key={cat.id} className="rounded-2xl">
              <CardContent className="flex items-center gap-4 py-4">
                <img
                  src={cat.photo}
                  alt={cat.name}
                  className="w-14 h-14 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-cat-dark">{cat.name}</h3>
                    <StatusBadge status={cat.status} />
                  </div>
                  <p className="text-xs text-charcoal/60 mt-0.5">
                    {cat.age} {cat.age === 1 ? "year" : "years"} old &middot; {cat.sex} &middot; {cat.lifeStage}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="cursor-pointer text-charcoal/60 hover:text-cat-dark"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="cursor-pointer text-charcoal/60 hover:text-heart"
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

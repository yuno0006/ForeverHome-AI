"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyCheckIn } from "@/types/checkIn";
import { Check, X } from "lucide-react";

interface DailyCheckInProps {
  day: number;
  catName: string;
  existingCheckIn?: DailyCheckIn;
  onSave: (checkIn: Omit<DailyCheckIn, "adoptionId" | "timestamp">) => void;
}

export default function DailyCheckInComponent({
  day,
  catName,
  existingCheckIn,
  onSave,
}: DailyCheckInProps) {
  const [ate, setAte] = useState(existingCheckIn?.ate ?? false);
  const [drank, setDrank] = useState(existingCheckIn?.drank ?? false);
  const [hiding, setHiding] = useState(existingCheckIn?.hiding ?? false);
  const [litterUsed, setLitterUsed] = useState(existingCheckIn?.litterUsed ?? false);
  const [notes, setNotes] = useState(existingCheckIn?.notes ?? "");

  const handleSave = () => {
    onSave({ day, ate, drank, hiding, litterUsed, notes: notes || undefined });
  };

  return (
    <Card className="border-border bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-cat-dark">
          Day {day} Check-In — {catName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center justify-between p-3 rounded-lg border border-border bg-warm-cream/50">
            <span className="text-sm font-medium">Ate today</span>
            <Switch checked={ate} onCheckedChange={setAte} />
          </label>
          <label className="flex items-center justify-between p-3 rounded-lg border border-border bg-warm-cream/50">
            <span className="text-sm font-medium">Drank water</span>
            <Switch checked={drank} onCheckedChange={setDrank} />
          </label>
          <label className="flex items-center justify-between p-3 rounded-lg border border-border bg-warm-cream/50">
            <span className="text-sm font-medium">Still hiding</span>
            <Switch checked={hiding} onCheckedChange={setHiding} />
          </label>
          <label className="flex items-center justify-between p-3 rounded-lg border border-border bg-warm-cream/50">
            <span className="text-sm font-medium">Used litter box</span>
            <Switch checked={litterUsed} onCheckedChange={setLitterUsed} />
          </label>
        </div>

        <Textarea
          placeholder="Optional notes (e.g., 'Came out for a few minutes while I was reading')"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[80px] resize-none"
        />

        <Button
          onClick={handleSave}
          className="w-full bg-sunny hover:bg-sunny/90 text-white"
        >
          Save Check-In
        </Button>
      </CardContent>
    </Card>
  );
}

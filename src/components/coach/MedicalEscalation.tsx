"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Phone, Building, X } from "lucide-react";

interface MedicalEscalationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MedicalEscalation({
  open,
  onOpenChange,
}: MedicalEscalationProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-risk-high/40 bg-white dark:bg-gray-900">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-risk-high/10 rounded-full p-2 shrink-0 animate-pulse">
              <AlertTriangle className="h-6 w-6 text-risk-high" />
            </div>
            <DialogTitle className="text-lg font-bold text-risk-high">
              MEDICAL EMERGENCY
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-gray-700 dark:text-gray-300 pt-2 space-y-2">
            <p className="font-semibold">
              ForeverHome cannot provide veterinary advice.
            </p>
            <p>
              Your message describes symptoms that require immediate
              professional veterinary care. For your cat&apos;s safety,
              the AI coach cannot respond to this message.
            </p>
            <p className="font-bold text-risk-high">
              Contact an emergency veterinarian immediately.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 mt-2">
          <Button
            variant="destructive"
            size="lg"
            className="w-full gap-2 font-bold text-base"
            onClick={() => window.open("tel:+1234567890")}
          >
            <Phone className="h-4 w-4" />
            Call Emergency Vet Now
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2 font-semibold"
            onClick={() => window.open("tel:+0987654321")}
          >
            <Building className="h-4 w-4" />
            Contact Shelter
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground mt-1"
            onClick={() => onOpenChange(false)}
          >
            I understand — close this message
          </Button>
        </div>

        <DialogFooter className="text-[10px] text-muted-foreground text-center w-full justify-center pt-1">
          If your cat is not breathing, bleeding severely, or unconscious,
          go to the nearest emergency vet immediately.
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

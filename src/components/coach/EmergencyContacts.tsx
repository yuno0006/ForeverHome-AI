"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Phone, Building, MapPin, Clock, AlertCircle } from "lucide-react";

export default function EmergencyContacts() {
  const [showVet, setShowVet] = useState(false);
  const [showShelter, setShowShelter] = useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-risk-high/30 text-risk-high hover:bg-risk-high/5"
          onClick={() => setShowVet(true)}
        >
          <Phone className="h-3 w-3" />
          Emergency Vet
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-sunny/30 text-cat-dark hover:bg-sunny/5"
          onClick={() => setShowShelter(true)}
        >
          <Building className="h-3 w-3" />
          Contact Shelter
        </Button>
      </div>

      {/* Emergency Vet Popup */}
      <Dialog open={showVet} onOpenChange={setShowVet}>
        <DialogContent className="sm:max-w-[400px] border-2 border-risk-high/20 rounded-2xl p-0 overflow-hidden">
          <div className="bg-risk-high/5 p-5 border-b border-risk-high/10">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-risk-high flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <DialogTitle className="text-lg font-bold text-cocoa">
                  Emergency Vet Contacts
                </DialogTitle>
              </div>
            </DialogHeader>
          </div>
          <div className="p-5 space-y-4">
            <div className="bg-white rounded-xl p-4 border border-cocoa/10 space-y-2">
              <h4 className="font-bold text-cocoa text-sm">24/7 Pet Emergency Hotline</h4>
              <div className="flex items-center gap-2 text-sm text-cocoa/70">
                <Phone className="w-3.5 h-3.5" />
                <a href="tel:+18005551234" className="font-semibold text-risk-high hover:underline">
                  1-800-555-1234
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-cocoa/70">
                <Clock className="w-3.5 h-3.5" />
                <span>Available 24 hours, 7 days a week</span>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-cocoa/10 space-y-2">
              <h4 className="font-bold text-cocoa text-sm">ASPCA Animal Poison Control</h4>
              <div className="flex items-center gap-2 text-sm text-cocoa/70">
                <Phone className="w-3.5 h-3.5" />
                <a href="tel:+18884264435" className="font-semibold text-risk-high hover:underline">
                  1-888-426-4435
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-cocoa/70">
                <Clock className="w-3.5 h-3.5" />
                <span>24/7 — consultation fee may apply</span>
              </div>
            </div>
            <p className="text-xs text-cocoa/50 font-medium text-center">
              If your cat is not breathing, bleeding severely, or unconscious — go to the nearest emergency vet immediately.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Shelter Popup */}
      <Dialog open={showShelter} onOpenChange={setShowShelter}>
        <DialogContent className="sm:max-w-[400px] border-2 border-sunny/20 rounded-2xl p-0 overflow-hidden">
          <div className="bg-sunny/5 p-5 border-b border-sunny/10">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sunny flex items-center justify-center">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <DialogTitle className="text-lg font-bold text-cocoa">
                  Shelter Contact Info
                </DialogTitle>
              </div>
            </DialogHeader>
          </div>
          <div className="p-5 space-y-4">
            <div className="bg-white rounded-xl p-4 border border-cocoa/10 space-y-2">
              <h4 className="font-bold text-cocoa text-sm">Paws Haven Rescue</h4>
              <div className="flex items-center gap-2 text-sm text-cocoa/70">
                <Phone className="w-3.5 h-3.5" />
                <a href="tel:+15551234567" className="font-semibold text-cocoa hover:underline">
                  (555) 123-4567
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-cocoa/70">
                <MapPin className="w-3.5 h-3.5" />
                <span>123 Adoption Lane, Portland, OR</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-cocoa/70">
                <Clock className="w-3.5 h-3.5" />
                <span>Mon–Sat: 9am–6pm, Sun: 10am–4pm</span>
              </div>
            </div>
            <p className="text-xs text-cocoa/50 font-medium text-center">
              For non-urgent behavioral questions, use the AI Coach chat first. The shelter team is available during business hours.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

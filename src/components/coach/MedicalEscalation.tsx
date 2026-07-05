import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Phone, Building } from "lucide-react";

export default function MedicalEscalation() {
  return (
    <Card className="border-risk-high bg-risk-high/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-risk-high/10 rounded-full p-1.5 shrink-0">
            <AlertTriangle className="h-5 w-5 text-risk-high" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-risk-high leading-tight">
              MEDICAL EMERGENCY
            </h3>
            <p className="text-[11px] text-foreground font-medium mt-0.5 leading-snug">
              ForeverHome cannot provide veterinary advice. Contact an emergency vet immediately.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="destructive"
            size="sm"
            className="flex-1 gap-1.5 h-8 text-xs font-bold"
            onClick={() => window.open("tel:+1234567890")}
          >
            <Phone className="h-3 w-3" />
            Call Emergency Vet
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 h-8 text-xs font-bold"
            onClick={() => window.open("tel:+0987654321")}
          >
            <Building className="h-3 w-3" />
            Contact Shelter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

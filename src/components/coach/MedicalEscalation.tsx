import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Phone, Building } from "lucide-react";

export default function MedicalEscalation() {
  return (
    <Card className="border-risk-high bg-risk-high/5">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-risk-high/10 rounded-full p-2">
            <AlertTriangle className="h-8 w-8 text-risk-high" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-risk-high">
              THIS MAY BE A MEDICAL EMERGENCY
            </h3>
          </div>
        </div>

        <p className="text-sm text-foreground mb-2">
          ForeverHome cannot provide veterinary advice.
        </p>
        <p className="text-sm font-medium text-foreground mb-6">
          Contact an emergency veterinarian immediately.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="destructive"
            className="flex-1 gap-2"
            onClick={() => window.open("tel:+1234567890")}
          >
            <Phone className="h-4 w-4" />
            Call Emergency Veterinarian
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => window.open("tel:+0987654321")}
          >
            <Building className="h-4 w-4" />
            Contact Shelter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

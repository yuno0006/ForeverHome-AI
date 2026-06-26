import { Button } from "@/components/ui/button";
import { Phone, Building, Heart } from "lucide-react";

export default function EmergencyContacts() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-2 border-risk-high/30 text-risk-high hover:bg-risk-high/5"
        onClick={() => window.open("tel:+1234567890")}
      >
        <Phone className="h-3 w-3" />
        Emergency Vet
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 border-sunny/30 text-cat-dark hover:bg-sunny/5"
        onClick={() => window.open("tel:+0987654321")}
      >
        <Building className="h-3 w-3" />
        Contact Shelter
      </Button>
    </div>
  );
}

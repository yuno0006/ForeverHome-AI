"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { updateUserDocument } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield, LogOut } from "lucide-react";
import { toast } from "sonner";
import { AdopterProfile, StaffProfile } from "@/types/user";

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}

function ProfileContent() {
  const { user, userDoc, role, logout } = useAuth();
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");

  // Adopter fields
  const [homeType, setHomeType] = useState<"apartment" | "house" | "other">("apartment");
  const [adultsInHome, setAdultsInHome] = useState(1);
  const [hasChildren, setHasChildren] = useState(false);
  const [hasOtherPets, setHasOtherPets] = useState(false);
  const [petExperience, setPetExperience] = useState<"none" | "beginner" | "intermediate" | "experienced">("none");
  const [hoursAwayDaily, setHoursAwayDaily] = useState(8);

  // Staff fields
  const [position, setPosition] = useState("");

  useEffect(() => {
    if (userDoc) {
      setDisplayName(userDoc.displayName || "");

      if (userDoc.role === "adopter" && userDoc.profile) {
        const p = userDoc.profile as AdopterProfile;
        setHomeType(p.homeType || "apartment");
        setAdultsInHome(p.adultsInHome || 1);
        setHasChildren(p.hasChildren || false);
        setHasOtherPets(p.hasOtherPets || false);
        setPetExperience(p.petExperience || "none");
        setHoursAwayDaily(p.hoursAwayDaily || 8);
      }

      if (userDoc.role === "shelter_staff" && userDoc.profile) {
        const p = userDoc.profile as StaffProfile;
        setPosition(p.position || "");
      }
    }
  }, [userDoc]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const updateData: Record<string, unknown> = { displayName };

      if (role === "adopter") {
        updateData.profile = {
          homeType,
          adultsInHome,
          hasChildren,
          childrenAges: [],
          hasOtherPets,
          petExperience,
          hoursAwayDaily,
        } satisfies AdopterProfile;
      }

      if (role === "shelter_staff") {
        const staffProfile = userDoc?.profile as StaffProfile | null;
        updateData.profile = {
          position,
          shelterRole: staffProfile?.shelterRole || "staff",
        } satisfies StaffProfile;
      }

      await updateUserDocument(user.uid, updateData);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cat-dark">My Profile</h1>
        <p className="mt-1 text-charcoal/50">Manage your account settings</p>
      </div>

      {/* Avatar & Role */}
      <Card className="bg-white border-2 border-cocoa/10 shadow-[4px_4px_0px_0px_rgba(42,29,20,1)] rounded-3xl mb-6 hover:-translate-y-1 transition-all">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-coral to-coral-deep p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="h-full w-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                {user?.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.photoURL}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-cocoa" />
                )}
              </div>
            </div>
            <div>
              <p className="text-lg font-bold text-cocoa">{displayName || "User"}</p>
              <Badge className="bg-coral/10 text-cocoa border border-coral/20 mt-1">
                <Shield className="h-3 w-3 mr-1" />
                {role === "shelter_staff" ? "Shelter Staff" : "Adopter"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Common Fields */}
      <Card className="bg-white border-2 border-cocoa/10 shadow-[4px_4px_0px_0px_rgba(42,29,20,1)] rounded-3xl mb-6 hover:-translate-y-1 transition-all">
        <CardHeader>
          <CardTitle className="text-cocoa">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 border-cocoa/20 rounded-xl focus:ring-2 focus:ring-coral/50 transition-all"
              placeholder="Your name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center gap-2 mt-1">
              <Mail className="h-4 w-4 text-cocoa/50" />
              <Input
                id="email"
                value={user?.email || ""}
                readOnly
                className="border-cocoa/20 rounded-xl bg-cream-dark/50 text-cocoa/70"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adopter-specific fields */}
      {role === "adopter" && (
        <Card className="bg-white border-2 border-cocoa/10 shadow-[4px_4px_0px_0px_rgba(42,29,20,1)] rounded-3xl mb-6 hover:-translate-y-1 transition-all">
          <CardHeader>
            <CardTitle className="text-cocoa">Home &amp; Lifestyle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="homeType">Home Type</Label>
              <select
                id="homeType"
                value={homeType}
                onChange={(e) => setHomeType(e.target.value as "apartment" | "house" | "other")}
                className="mt-1 w-full rounded-xl border border-cocoa/20 bg-white px-3 py-2 text-sm text-cocoa focus:outline-none focus:ring-2 focus:ring-coral"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <Label htmlFor="adults">Adults in Home</Label>
              <Input
                id="adults"
                type="number"
                min={1}
                value={adultsInHome}
                onChange={(e) => setAdultsInHome(Number(e.target.value))}
                className="mt-1 border-cocoa/20 rounded-xl focus:ring-2 focus:ring-coral/50 transition-all"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="hasChildren"
                checked={hasChildren}
                onChange={(e) => setHasChildren(e.target.checked)}
                className="h-4 w-4 rounded border-cocoa/20 text-coral focus:ring-coral"
              />
              <Label htmlFor="hasChildren">Has children in home</Label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="hasOtherPets"
                checked={hasOtherPets}
                onChange={(e) => setHasOtherPets(e.target.checked)}
                className="h-4 w-4 rounded border-cocoa/20 text-coral focus:ring-coral"
              />
              <Label htmlFor="hasOtherPets">Has other pets</Label>
            </div>

            <div>
              <Label htmlFor="petExperience">Pet Experience Level</Label>
              <select
                id="petExperience"
                value={petExperience}
                onChange={(e) => setPetExperience(e.target.value as "none" | "beginner" | "intermediate" | "experienced")}
                className="mt-1 w-full rounded-xl border border-cocoa/20 bg-white px-3 py-2 text-sm text-cocoa focus:outline-none focus:ring-2 focus:ring-coral"
              >
                <option value="none">None</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="experienced">Experienced</option>
              </select>
            </div>

            <div>
              <Label htmlFor="hoursAway">Hours Away Daily</Label>
              <Input
                id="hoursAway"
                type="number"
                min={0}
                max={24}
                value={hoursAwayDaily}
                onChange={(e) => setHoursAwayDaily(Number(e.target.value))}
                className="mt-1 border-cocoa/20 rounded-xl focus:ring-2 focus:ring-coral/50 transition-all"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff-specific fields */}
      {role === "shelter_staff" && (
        <Card className="bg-white border-2 border-cocoa/10 shadow-[4px_4px_0px_0px_rgba(42,29,20,1)] rounded-3xl mb-6 hover:-translate-y-1 transition-all">
          <CardHeader>
            <CardTitle className="text-cocoa">Staff Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="mt-1 border-cocoa/20 rounded-xl focus:ring-2 focus:ring-coral/50 transition-all"
                placeholder="e.g., Adoption Coordinator"
              />
            </div>

            <div>
              <Label>Shelter</Label>
              <Input
                value={userDoc?.shelterId ? "ForeverHome Shelter" : "Not assigned"}
                readOnly
                className="mt-1 border-cocoa/20 rounded-xl bg-cream-dark/50 text-cocoa/70"
              />
            </div>

            <div className="flex items-center gap-2">
              <Label>Shelter Role</Label>
              <Badge className="bg-coral/10 text-cocoa border border-coral/20">
                {(userDoc?.profile as StaffProfile)?.shelterRole || "staff"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save & Logout Buttons */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-cocoa hover:bg-cocoa-soft text-cream font-semibold rounded-xl h-11 mb-3 border-2 border-cocoa shadow-[3px_3px_0px_0px_rgba(255,107,107,1)]"
      >
        {saving ? "Saving..." : "Save Changes"}
      </Button>
      <Button
        variant="outline"
        onClick={() => logout()}
        className="w-full border-2 border-coral/30 text-coral hover:bg-coral/5 rounded-xl h-11 font-semibold"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
}

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
import { User, Mail, Shield } from "lucide-react";
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
  const { user, userDoc, role } = useAuth();
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
      <Card className="bg-white border-sunny/20 rounded-2xl mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-sunny-light flex items-center justify-center overflow-hidden">
              {user?.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt="Avatar"
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-cat-dark" />
              )}
            </div>
            <div>
              <p className="text-lg font-bold text-cat-dark">{displayName || "User"}</p>
              <Badge className="bg-sunny/20 text-cat-dark mt-1">
                <Shield className="h-3 w-3 mr-1" />
                {role === "shelter_staff" ? "Shelter Staff" : "Adopter"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Common Fields */}
      <Card className="bg-white border-sunny/20 rounded-2xl mb-6">
        <CardHeader>
          <CardTitle className="text-cat-dark">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 border-sunny/20 rounded-xl"
              placeholder="Your name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center gap-2 mt-1">
              <Mail className="h-4 w-4 text-charcoal/50" />
              <Input
                id="email"
                value={user?.email || ""}
                readOnly
                className="border-sunny/20 rounded-xl bg-warm-cream/50 text-charcoal/70"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adopter-specific fields */}
      {role === "adopter" && (
        <Card className="bg-white border-sunny/20 rounded-2xl mb-6">
          <CardHeader>
            <CardTitle className="text-cat-dark">Home & Lifestyle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="homeType">Home Type</Label>
              <select
                id="homeType"
                value={homeType}
                onChange={(e) => setHomeType(e.target.value as "apartment" | "house" | "other")}
                className="mt-1 w-full rounded-xl border border-sunny/20 bg-white px-3 py-2 text-sm text-cat-dark focus:outline-none focus:ring-2 focus:ring-sunny"
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
                className="mt-1 border-sunny/20 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="hasChildren"
                checked={hasChildren}
                onChange={(e) => setHasChildren(e.target.checked)}
                className="h-4 w-4 rounded border-sunny/20 text-sunny focus:ring-sunny"
              />
              <Label htmlFor="hasChildren">Has children in home</Label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="hasOtherPets"
                checked={hasOtherPets}
                onChange={(e) => setHasOtherPets(e.target.checked)}
                className="h-4 w-4 rounded border-sunny/20 text-sunny focus:ring-sunny"
              />
              <Label htmlFor="hasOtherPets">Has other pets</Label>
            </div>

            <div>
              <Label htmlFor="petExperience">Pet Experience Level</Label>
              <select
                id="petExperience"
                value={petExperience}
                onChange={(e) => setPetExperience(e.target.value as "none" | "beginner" | "intermediate" | "experienced")}
                className="mt-1 w-full rounded-xl border border-sunny/20 bg-white px-3 py-2 text-sm text-cat-dark focus:outline-none focus:ring-2 focus:ring-sunny"
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
                className="mt-1 border-sunny/20 rounded-xl"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff-specific fields */}
      {role === "shelter_staff" && (
        <Card className="bg-white border-sunny/20 rounded-2xl mb-6">
          <CardHeader>
            <CardTitle className="text-cat-dark">Staff Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="mt-1 border-sunny/20 rounded-xl"
                placeholder="e.g., Adoption Coordinator"
              />
            </div>

            <div>
              <Label>Shelter</Label>
              <Input
                value={userDoc?.shelterId ? "ForeverHome Shelter" : "Not assigned"}
                readOnly
                className="mt-1 border-sunny/20 rounded-xl bg-warm-cream/50 text-charcoal/70"
              />
            </div>

            <div className="flex items-center gap-2">
              <Label>Shelter Role</Label>
              <Badge className="bg-sunny/20 text-cat-dark">
                {(userDoc?.profile as StaffProfile)?.shelterRole || "staff"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-sunny hover:bg-sunny/90 text-cat-dark font-semibold rounded-xl h-11"
      >
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}

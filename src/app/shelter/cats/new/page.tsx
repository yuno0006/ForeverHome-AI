"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { createCat, uploadCatPhoto } from "@/lib/catService";

export default function AddNewCatPage() {
  const router = useRouter();
  const { user, userDoc } = useAuth();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    age: "",
    sex: "male",
    lifeStage: "adult",
    neutered: false,
    photo: null as File | null,
    photoPreview: "",
    energy: "medium",
    sociability: "moderate",
    stressSensitivity: "moderate",
    handlingTolerance: "moderate",
    playNeeds: "moderate",
    comfortableWithChildren: "unknown",
    comfortableWithCats: "unknown",
    comfortableWithDogs: "unknown",
    noiseTolerance: "moderate",
    needsVerticalSpace: "moderate",
    indoorOnlyRequired: true,
    knownMedicalNeeds: "",
    medicationNeeds: "",
    fivStatus: "negative",
    specialNotes: "",
    status: "available",
  });

  const handleChange = (field: string, value: string | boolean | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({
        ...prev,
        photo: file,
        photoPreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const shelterId = userDoc?.shelterId || "demo-shelter";
    const createdBy = user?.uid || "demo-user";

    try {
      // Create the cat document first
      const catId = await createCat({
        name: form.name,
        age: Number(form.age),
        sex: form.sex as "male" | "female",
        lifeStage: form.lifeStage as "kitten" | "young" | "adult" | "senior",
        neutered: form.neutered,
        photo: "",
        shelterId,
        createdBy,
        status: form.status as "available" | "adopted" | "pending" | "archived",
        behavior: {
          energy: form.energy,
          sociability: form.sociability,
          stressSensitivity: form.stressSensitivity,
          handlingTolerance: form.handlingTolerance,
          playNeeds: form.playNeeds,
          comfortableWithChildren: form.comfortableWithChildren,
          comfortableWithCats: form.comfortableWithCats,
          comfortableWithDogs: form.comfortableWithDogs,
          noiseTolerance: form.noiseTolerance,
          needsVerticalSpace: form.needsVerticalSpace,
          indoorOnlyRequired: form.indoorOnlyRequired,
        },
        care: {
          knownMedicalNeeds: form.knownMedicalNeeds,
          medicationNeeds: form.medicationNeeds,
          fivStatus: form.fivStatus,
          specialNotes: form.specialNotes,
        },
      });

      // Upload photo if selected
      if (form.photo) {
        try {
          await uploadCatPhoto(shelterId, catId, form.photo);
        } catch (uploadError) {
          console.error("Photo upload failed:", uploadError);
          // Continue without photo - already set to empty string
        }
      }

      toast.success("Cat profile created!");
      router.push("/shelter/cats");
    } catch (error) {
      console.error("Failed to create cat:", error);
      toast.error("Failed to save. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/shelter/cats"
          className="p-2 rounded-xl hover:bg-sunny-light transition-colors duration-200 cursor-pointer"
        >
          <ArrowLeft className="size-5 text-cat-dark" />
        </Link>
        <h1 className="text-2xl font-bold text-cat-dark">Add New Cat</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-cat-dark">
              Basic Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Cat name"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="age">Age (years)</Label>
                <Input
                  id="age"
                  type="number"
                  min="0"
                  value={form.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                  placeholder="Age"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Sex</Label>
                <Select value={form.sex} onValueChange={(v: string | null) => v && handleChange("sex", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Life Stage</Label>
                <Select value={form.lifeStage} onValueChange={(v: string | null) => v && handleChange("lifeStage", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kitten">Kitten</SelectItem>
                    <SelectItem value="young">Young</SelectItem>
                    <SelectItem value="adult">Adult</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.neutered}
                    onChange={(e) => handleChange("neutered", e.target.checked)}
                    className="rounded border-sunny/40 text-sunny focus:ring-sunny cursor-pointer"
                  />
                  <span className="text-sm font-medium">Neutered</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photo */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-cat-dark">
              Photo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {form.photoPreview && (
                <div className="w-40 h-40 rounded-2xl overflow-hidden border border-sunny/20">
                  <img
                    src={form.photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Behavior */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-cat-dark">
              Behavior
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Energy</Label>
                <Select value={form.energy} onValueChange={(v: string | null) => v && handleChange("energy", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Sociability</Label>
                <Select value={form.sociability} onValueChange={(v: string | null) => v && handleChange("sociability", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="outgoing">Outgoing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Stress Sensitivity</Label>
                <Select value={form.stressSensitivity} onValueChange={(v: string | null) => v && handleChange("stressSensitivity", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Handling Tolerance</Label>
                <Select value={form.handlingTolerance} onValueChange={(v: string | null) => v && handleChange("handlingTolerance", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Play Needs</Label>
                <Select value={form.playNeeds} onValueChange={(v: string | null) => v && handleChange("playNeeds", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Noise Tolerance</Label>
                <Select value={form.noiseTolerance} onValueChange={(v: string | null) => v && handleChange("noiseTolerance", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Vertical Space Needs</Label>
                <Select value={form.needsVerticalSpace} onValueChange={(v: string | null) => v && handleChange("needsVerticalSpace", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <Label>Comfortable with Children</Label>
                <Select value={form.comfortableWithChildren} onValueChange={(v: string | null) => v && handleChange("comfortableWithChildren", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Comfortable with Cats</Label>
                <Select value={form.comfortableWithCats} onValueChange={(v: string | null) => v && handleChange("comfortableWithCats", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Comfortable with Dogs</Label>
                <Select value={form.comfortableWithDogs} onValueChange={(v: string | null) => v && handleChange("comfortableWithDogs", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={form.indoorOnlyRequired}
                onChange={(e) => handleChange("indoorOnlyRequired", e.target.checked)}
                className="rounded border-sunny/40 text-sunny focus:ring-sunny cursor-pointer"
              />
              <span className="text-sm font-medium">Indoor Only</span>
            </label>
          </CardContent>
        </Card>

        {/* Care */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-cat-dark">
              Care
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="knownMedicalNeeds">Known Medical Needs</Label>
              <textarea
                id="knownMedicalNeeds"
                value={form.knownMedicalNeeds}
                onChange={(e) => handleChange("knownMedicalNeeds", e.target.value)}
                placeholder="Describe any medical needs..."
                rows={3}
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-charcoal/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="medicationNeeds">Medication Needs</Label>
                <Input
                  id="medicationNeeds"
                  value={form.medicationNeeds}
                  onChange={(e) => handleChange("medicationNeeds", e.target.value)}
                  placeholder="Medication details"
                />
              </div>
              <div className="space-y-1.5">
                <Label>FIV Status</Label>
                <Select value={form.fivStatus} onValueChange={(v: string | null) => v && handleChange("fivStatus", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="specialNotes">Special Notes</Label>
              <textarea
                id="specialNotes"
                value={form.specialNotes}
                onChange={(e) => handleChange("specialNotes", e.target.value)}
                placeholder="Any additional notes..."
                rows={3}
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-charcoal/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-cat-dark">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label>Adoption Status</Label>
              <Select value={form.status} onValueChange={(v: string | null) => v && handleChange("status", v)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="adopted">Adopted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Link href="/shelter/cats">
            <Button variant="ghost" className="cursor-pointer">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={saving}
            className="cursor-pointer bg-sunny hover:bg-sunny/80 text-cat-dark"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 mr-1 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Cat Profile"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

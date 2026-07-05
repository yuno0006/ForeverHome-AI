"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Home,
  Building2,
  Cat,
  Check,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  updateUserDocument,
} from "@/lib/auth";
import { createShelter } from "@/lib/shelterService";
import { saveAdopterProfile } from "@/lib/firestoreService";
import { UserRole } from "@/types/user";
import {
  HomeType,
  CatExperience,
  WorkHours,
  TravelFrequency,
  HouseholdNoise,
  PersonalityPreference,
  AgePreference,
} from "@/types/adopterProfile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

type PetExperience = "none" | "beginner" | "intermediate" | "experienced";

const selectClasses =
  "h-11 w-full rounded-xl border border-sunny/20 bg-white px-3 text-sm text-cat-dark outline-none transition-colors duration-200 focus-visible:border-sunny focus-visible:ring-3 focus-visible:ring-sunny/20 disabled:cursor-not-allowed disabled:opacity-50";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, userDoc, loading, refreshUserDoc } = useAuth();

  // Wizard state
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Shared
  const [displayName, setDisplayName] = useState("");

  // Adopter profile fields
  const [homeType, setHomeType] = useState<HomeType>("apartment");
  const [adultsInHome, setAdultsInHome] = useState(1);
  const [hasChildren, setHasChildren] = useState(false);
  const [childrenAges, setChildrenAges] = useState<string[]>([]);
  const [hasOtherPets, setHasOtherPets] = useState(false);
  const [existingCats, setExistingCats] = useState(0);
  const [existingDogs, setExistingDogs] = useState(0);
  const [otherPets, setOtherPets] = useState("");
  const [hasGarden, setHasGarden] = useState(false);
  const [indoorOnlyPreference, setIndoorOnlyPreference] = useState(true);
  const [petExperience, setPetExperience] = useState<PetExperience>("none");
  const [hoursAwayDaily, setHoursAwayDaily] = useState(8);
  const [workHours, setWorkHours] = useState<WorkHours>("out-part-day");
  const [travelFrequency, setTravelFrequency] = useState<TravelFrequency>("occasional");
  const [householdNoise, setHouseholdNoise] = useState<HouseholdNoise>("moderate");
  const [personalityPreference, setPersonalityPreference] = useState<PersonalityPreference[]>([]);
  const [agePreference, setAgePreference] = useState<AgePreference[]>([]);
  const [specialNeedsOpenness, setSpecialNeedsOpenness] = useState(false);

  // Shelter fields
  const [shelterName, setShelterName] = useState("");
  const [shelterAddress, setShelterAddress] = useState("");
  const [shelterPhone, setShelterPhone] = useState("");
  const [shelterEmail, setShelterEmail] = useState("");

  // Prefill from the user document once it loads.
  useEffect(() => {
    if (userDoc) {
      setDisplayName(userDoc.displayName ?? "");
      setShelterEmail(userDoc.email ?? "");
    }
  }, [userDoc]);

  // Guard: unauthenticated users go to login.
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login?redirect=/onboarding");
    }
  }, [loading, user, router]);

  // Guard: already-onboarded users skip straight to their dashboard.
  useEffect(() => {
    if (loading) return;
    if (userDoc?.onboardingComplete) {
      router.replace(
        userDoc.role === "shelter_staff" ? "/shelter/dashboard" : "/dashboard"
      );
    }
  }, [loading, userDoc, router]);

  // Total number of steps depends on the chosen path.
  const totalSteps = useMemo(() => {
    if (selectedRole === "shelter_staff") return 3; // role -> shelter info -> cats
    return 2; // role -> adopter profile
  }, [selectedRole]);

  const progress = Math.round(((step + 1) / totalSteps) * 100);

  function goRoleNext() {
    if (!selectedRole) return;
    setError("");
    setStep(1);
  }

  async function finishAdopter() {
    if (!user) return;
    if (!displayName.trim()) {
      setError("Please tell us your name.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      // Save adopter profile to Firestore subcollection
      await saveAdopterProfile(user.uid, {
        name: displayName.trim(),
        profilePhoto: null,
        email: user.email || "",
        phone: null,
        homeType,
        hasChildren,
        childrenAges: hasChildren ? childrenAges : [],
        hasExistingPets: hasOtherPets,
        existingPets: {
          cats: hasOtherPets ? existingCats : 0,
          dogs: hasOtherPets ? existingDogs : 0,
          other: hasOtherPets && otherPets.trim() ? [otherPets.trim()] : [],
        },
        hasGarden,
        indoorOnlyPreference,
        workHours,
        travelFrequency,
        householdNoise,
        catExperience: petExperience as CatExperience,
        personalityPreference,
        agePreference,
        specialNeedsOpenness,
      });

      // Update user document with profile reference
      await updateUserDocument(user.uid, {
        role: "adopter",
        displayName: displayName.trim(),
        onboardingComplete: true,
        shelterId: null,
        hasAdopterProfile: true,
        // Keep legacy profile for backward compatibility during migration
        profile: {
          homeType: homeType === "condo" ? "apartment" : homeType,
          adultsInHome: Number(adultsInHome) || 0,
          hasChildren,
          childrenAges: hasChildren ? childrenAges : [],
          hasOtherPets,
          petExperience,
          hoursAwayDaily: Number(hoursAwayDaily) || 0,
        },
      });
      await refreshUserDoc();
      router.replace("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong saving your profile.";
      setError(message);
      setSubmitting(false);
    }
  }

  async function finishShelterInfo() {
    if (!user) return;
    if (!displayName.trim()) {
      setError("Please tell us your name.");
      return;
    }
    if (!shelterName.trim()) {
      setError("Please enter your shelter's name.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      // Shelter docs are keyed by the admin's uid so firestore.rules can look
      // up `shelters/{request.auth.uid}` directly when checking admin rights.
      const shelterId = user.uid;
      await createShelter(
        {
          name: shelterName.trim(),
          address: shelterAddress.trim(),
          phone: shelterPhone.trim(),
          email: shelterEmail.trim(),
          adminUid: user.uid,
          logoUrl: null,
        },
        shelterId
      );
      await updateUserDocument(user.uid, {
        role: "shelter_staff",
        displayName: displayName.trim(),
        shelterId,
        onboardingComplete: true,
        profile: {
          position: "Staff",
          shelterRole: "admin",
        },
      });
      await refreshUserDoc();
      // Move to the optional "add cats" sub-step.
      setStep(2);
      setSubmitting(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong creating your shelter.";
      setError(message);
      setSubmitting(false);
    }
  }

  // While auth resolves or we are about to redirect, show a friendly loader.
  if (loading || !user || userDoc?.onboardingComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-3xl bg-coral flex items-center justify-center border-2 border-cocoa shadow-[4px_4px_0px_0px_rgba(42,29,20,1)] animate-wiggle">
            <PawPrint className="w-8 h-8 text-white" />
          </div>
          <p className="font-display text-cocoa font-bold">Loading your journey…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        {/* Header + progress */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-3xl bg-coral flex items-center justify-center border-2 border-cocoa shadow-[4px_4px_0px_0px_rgba(42,29,20,1)]">
            <Cat className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-cocoa tracking-tight">
            Welcome to<br /><span className="text-gradient-warm italic">ForeverHome</span>
          </h1>
          <p className="mt-3 text-cocoa/70 font-medium">
            Let&apos;s set things up so we can find the perfect match.
          </p>
        </div>

        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-cocoa/50 uppercase tracking-wide">
            <span>
              Step {step + 1} of {totalSteps}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white border-2 border-cocoa shadow-[2px_2px_0px_0px_rgba(42,29,20,0.5)]">
            <div
              className="h-full rounded-full bg-coral transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {error && (
          <div
            className="mb-6 rounded-2xl bg-coral/10 border-2 border-coral px-4 py-3 text-sm font-bold text-coral flex items-center gap-2"
            role="alert"
          >
            <span className="text-lg">⚠️</span> {error}
          </div>
        )}

        {/* STEP 1 — Role selection */}
        {step === 0 && (
          <div>
            <h2 className="mb-6 text-center text-xl font-semibold text-cat-dark">
              Who are you?
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setSelectedRole("adopter")}
                className={`group flex flex-col items-center gap-4 rounded-2xl border-2 p-8 text-center shadow-sm cursor-pointer transition-all duration-200 ${
                  selectedRole === "adopter"
                    ? "border-heart bg-heart/5 shadow-md ring-2 ring-heart/20"
                    : "border-sunny/20 bg-white hover:border-heart/50 hover:shadow-md"
                }`}
              >
                <div className="flex size-16 items-center justify-center rounded-2xl bg-heart/10">
                  <Heart className="size-8 text-heart" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-cat-dark">
                    I&apos;m an Adopter
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Find your purrfect companion
                  </p>
                </div>
                {selectedRole === "adopter" && (
                  <span className="flex items-center gap-1 text-sm font-medium text-heart">
                    <Check className="size-4" /> Selected
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole("shelter_staff")}
                className={`group flex flex-col items-center gap-4 rounded-2xl border-2 p-8 text-center shadow-sm cursor-pointer transition-all duration-200 ${
                  selectedRole === "shelter_staff"
                    ? "border-sunny bg-sunny/5 shadow-md ring-2 ring-sunny/20"
                    : "border-sunny/20 bg-white hover:border-sunny/50 hover:shadow-md"
                }`}
              >
                <div className="flex size-16 items-center justify-center rounded-2xl bg-sunny-light">
                  <Building2 className="size-8 text-sunny" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-cat-dark">
                    Shelter / Rescue (Beta)
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Manage cats &amp; adoptions
                  </p>
                </div>
                {selectedRole === "shelter_staff" && (
                  <span className="flex items-center gap-1 text-sm font-medium text-sunny">
                    <Check className="size-4" /> Selected
                  </span>
                )}
              </button>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                type="button"
                onClick={goRoleNext}
                disabled={!selectedRole}
                className="h-11 cursor-pointer bg-sunny text-cat-dark hover:bg-sunny/90 transition-colors duration-200"
              >
                Continue <ArrowRight className="ml-1 size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2A — Adopter profile */}
        {step === 1 && selectedRole === "adopter" && (
          <div className="rounded-2xl border border-sunny/20 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 text-xl font-semibold text-cat-dark">
              Tell us about your home
            </h2>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="displayName">Display name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  disabled={submitting}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="homeType">Home type</Label>
                <select
                  id="homeType"
                  className={selectClasses}
                  value={homeType}
                  onChange={(e) => setHomeType(e.target.value as HomeType)}
                  disabled={submitting}
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="condo">Condo</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-sunny/20 bg-warm-cream/50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-cat-dark">
                    Garden or outdoor space
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Do you have a garden or yard?
                  </p>
                </div>
                <Switch
                  checked={hasGarden}
                  onCheckedChange={(v) => setHasGarden(v)}
                  disabled={submitting}
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-sunny/20 bg-warm-cream/50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-cat-dark">
                    Indoor-only preference
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Prefer an indoor-only cat?
                  </p>
                </div>
                <Switch
                  checked={indoorOnlyPreference}
                  onCheckedChange={(v) => setIndoorOnlyPreference(v)}
                  disabled={submitting}
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-sunny/20 bg-warm-cream/50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-cat-dark">
                    Children at home
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Helps us match cats that love kids
                  </p>
                </div>
                <Switch
                  checked={hasChildren}
                  onCheckedChange={(v) => setHasChildren(v)}
                  disabled={submitting}
                />
              </div>

              {hasChildren && (
                <div className="flex flex-col gap-1.5">
                  <Label>Children ages</Label>
                  <div className="flex flex-wrap gap-2">
                    {["0-4", "5-9", "10-14", "15+"].map((age) => (
                      <button
                        key={age}
                        type="button"
                        onClick={() => {
                          if (childrenAges.includes(age)) {
                            setChildrenAges(childrenAges.filter((a) => a !== age));
                          } else {
                            setChildrenAges([...childrenAges, age]);
                          }
                        }}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                          childrenAges.includes(age)
                            ? "bg-sunny text-cat-dark"
                            : "bg-sunny/10 text-cat-dark hover:bg-sunny/20"
                        }`}
                        disabled={submitting}
                      >
                        {age}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between rounded-xl border border-sunny/20 bg-warm-cream/50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-cat-dark">
                    Other pets at home
                  </p>
                  <p className="text-xs text-muted-foreground">
                    So we can check for good roommates
                  </p>
                </div>
                <Switch
                  checked={hasOtherPets}
                  onCheckedChange={(v) => setHasOtherPets(v)}
                  disabled={submitting}
                />
              </div>

              {hasOtherPets && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="existingCats">Cats</Label>
                    <Input
                      id="existingCats"
                      type="number"
                      min={0}
                      value={existingCats}
                      onChange={(e) => setExistingCats(Number(e.target.value))}
                      disabled={submitting}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="existingDogs">Dogs</Label>
                    <Input
                      id="existingDogs"
                      type="number"
                      min={0}
                      value={existingDogs}
                      onChange={(e) => setExistingDogs(Number(e.target.value))}
                      disabled={submitting}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="petExperience">Cat experience</Label>
                <select
                  id="petExperience"
                  className={selectClasses}
                  value={petExperience}
                  onChange={(e) =>
                    setPetExperience(e.target.value as PetExperience)
                  }
                  disabled={submitting}
                >
                  <option value="none">None</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="experienced">Experienced</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="workHours">Work schedule</Label>
                <select
                  id="workHours"
                  className={selectClasses}
                  value={workHours}
                  onChange={(e) => setWorkHours(e.target.value as WorkHours)}
                  disabled={submitting}
                >
                  <option value="home-most-day">Home most of the day</option>
                  <option value="out-part-day">Out part of the day</option>
                  <option value="out-most-day">Out most of the day</option>
                  <option value="varies">Varies</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="householdNoise">Household activity level</Label>
                <select
                  id="householdNoise"
                  className={selectClasses}
                  value={householdNoise}
                  onChange={(e) => setHouseholdNoise(e.target.value as HouseholdNoise)}
                  disabled={submitting}
                >
                  <option value="quiet">Quiet</option>
                  <option value="moderate">Moderate</option>
                  <option value="active">Active</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Personality preference</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "calm", label: "Calm" },
                    { value: "playful", label: "Playful" },
                    { value: "independent", label: "Independent" },
                    { value: "affectionate", label: "Affectionate" },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        const pref = value as PersonalityPreference;
                        if (personalityPreference.includes(pref)) {
                          setPersonalityPreference(
                            personalityPreference.filter((p) => p !== pref)
                          );
                        } else {
                          setPersonalityPreference([...personalityPreference, pref]);
                        }
                      }}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                        personalityPreference.includes(value as PersonalityPreference)
                          ? "bg-sunny text-cat-dark"
                          : "bg-sunny/10 text-cat-dark hover:bg-sunny/20"
                      }`}
                      disabled={submitting}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Age preference</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "kitten", label: "Kitten" },
                    { value: "adult", label: "Adult" },
                    { value: "senior", label: "Senior" },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        const pref = value as AgePreference;
                        if (agePreference.includes(pref)) {
                          setAgePreference(agePreference.filter((p) => p !== pref));
                        } else {
                          setAgePreference([...agePreference, pref]);
                        }
                      }}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                        agePreference.includes(value as AgePreference)
                          ? "bg-sunny text-cat-dark"
                          : "bg-sunny/10 text-cat-dark hover:bg-sunny/20"
                      }`}
                      disabled={submitting}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-sunny/20 bg-warm-cream/50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-cat-dark">
                    Open to special needs cats
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cats that need extra care and attention
                  </p>
                </div>
                <Switch
                  checked={specialNeedsOpenness}
                  onCheckedChange={(v) => setSpecialNeedsOpenness(v)}
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(0)}
                disabled={submitting}
                className="h-11 cursor-pointer transition-colors duration-200"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={finishAdopter}
                disabled={submitting}
                className="h-11 cursor-pointer bg-sunny text-cat-dark hover:bg-sunny/90 transition-colors duration-200"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    Finish <Check className="ml-1 size-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2B-i — Shelter info */}
        {step === 1 && selectedRole === "shelter_staff" && (
          <div className="rounded-2xl border border-sunny/20 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 text-xl font-semibold text-cat-dark">
              Set up your shelter
            </h2>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="displayName">Your name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  disabled={submitting}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="shelterName">Shelter name</Label>
                <Input
                  id="shelterName"
                  value={shelterName}
                  onChange={(e) => setShelterName(e.target.value)}
                  placeholder="Happy Tails Rescue"
                  disabled={submitting}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="shelterAddress">Address</Label>
                <Input
                  id="shelterAddress"
                  value={shelterAddress}
                  onChange={(e) => setShelterAddress(e.target.value)}
                  placeholder="123 Meow Street, Catsville"
                  disabled={submitting}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="shelterPhone">Phone</Label>
                <Input
                  id="shelterPhone"
                  type="tel"
                  value={shelterPhone}
                  onChange={(e) => setShelterPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  disabled={submitting}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="shelterEmail">Email</Label>
                <Input
                  id="shelterEmail"
                  type="email"
                  value={shelterEmail}
                  onChange={(e) => setShelterEmail(e.target.value)}
                  placeholder="hello@shelter.org"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(0)}
                disabled={submitting}
                className="h-11 cursor-pointer transition-colors duration-200"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={finishShelterInfo}
                disabled={submitting}
                className="h-11 cursor-pointer bg-sunny text-cat-dark hover:bg-sunny/90 transition-colors duration-200"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    Continue <ArrowRight className="ml-1 size-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2B-ii — Add cats (optional) */}
        {step === 2 && selectedRole === "shelter_staff" && (
          <div className="rounded-2xl border border-sunny/20 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-sunny-light">
              <Cat className="size-8 text-sunny" />
            </div>
            <h2 className="text-xl font-semibold text-cat-dark">
              How many cats do you have?
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              You can add cats now or later from your dashboard. There&apos;s no
              rush, your shelter is all set up.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                type="button"
                onClick={() => router.replace("/shelter/cats/new")}
                className="h-11 cursor-pointer bg-sunny text-cat-dark hover:bg-sunny/90 transition-colors duration-200"
              >
                <Cat className="mr-1 size-4" /> Add cats now
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.replace("/shelter/dashboard")}
                className="h-11 cursor-pointer transition-colors duration-200"
              >
                Skip for now <Home className="ml-1 size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

# Data Model Reference

Complete field-level reference for all Firestore collections and TypeScript types in ForeverHome AI.

---

## Collection Overview

| Collection / Subcollection | Path | Access |
|---|---|---|
| Users | `users/{uid}` | Owner: r/w; Shelter staff: r |
| Adopter Profile | `users/{uid}/adopterProfile` | Owner: r/w |
| Cats | `cats/{catId}` | Auth: r; Shelter staff: r/w |
| Matches | `matches/{matchId}` | Owner: r/w; Shelter: r |
| Assessments | `assessments/{sessionId}` | Owner: r |
| Active Adoptions | `activeAdoptions/{adoptionId}` | Owner: r/w (by adopterUid) |
| Adoptions | `adoptions/{adoptionId}` | Shelter: r/w; Owner: r |
| Wishlists | `users/{uid}/savedCats` | Owner: r/w |
| Check-ins | `checkIns/{checkInId}` | Owner: r/w |
| AI Logs | `aiLogs/{logId}` | Owner: create only (write-only) |
| Leaderboard | `leaderboard/{userId}` | Auth: r |
| Shelter Insights | `shelters/{shelterId}/insights` | Shelter staff: r |

---

## Type Definitions (`src/types/`)

### 1. `user.ts` — User & Auth

```ts
type UserRole = "adopter" | "shelter_staff" | "admin";
type ShelterRole = "owner" | "manager" | "volunteer";

interface StaffProfile {
  shelterId: string;
  shelterName: string;
  shelterRole: ShelterRole;
}

interface UserDocument {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL: string | null;
  onboardingComplete: boolean;
  shelterId: string | null;
  profile: AdopterProfile | null;
  staffProfile?: StaffProfile;
  createdAt: Timestamp;
  legacyRole?: string; // migration field
}
```

**Firestore path**: `users/{uid}`
**Validation**: `onboardingComplete` gates redirect to `/onboarding`

---

### 2. `adopterProfile.ts` — Adopter Lifestyle Profile

```ts
type HomeType = "apartment" | "house" | "condo" | "other";
type WorkHours = "remote" | "hybrid" | "fullTime" | "flexible" | "retired";
type TravelFrequency = "rarely" | "occasionally" | "frequently";
type HouseholdNoise = "quiet" | "moderate" | "busy";
type CatExperience = "none" | "beginner" | "intermediate" | "experienced" | "expert";
type PersonalityPreference = "cuddly" | "playful" | "calm" | "independent";
type AgePreference = "kitten" | "young" | "adult" | "senior" | "any";

interface AdopterProfile {
  homeType: HomeType;
  workHours: WorkHours;
  travelFrequency: TravelFrequency;
  householdNoise: HouseholdNoise;
  catExperience: CatExperience;
  personalityPreference: PersonalityPreference;
  agePreference: AgePreference;
  hasChildren: boolean;
  hasOtherPets: boolean;
  existingPets?: AdopterExistingPets;
  hoursAwayPerDay: number;
  outdoorAccess: boolean;
}
```

**Firestore path**: `users/{uid}/adopterProfile` (subcollection)

---

### 3. `adopter.ts` — Adopter (Legacy Flat)

```ts
interface Child { age: number; }
interface ExistingPets { cats: number; dogs: number; others: string; }
interface Adopter { /* flat fields for compatibility calc */ }
interface AdopterAnswers { /* quiz answer record */ }
```

> **Note**: Replaced by `AdopterProfile` in the new Firestore-native model. `Adopter`/`AdopterAnswers` remain for backward compatibility in the compatibility engine.

---

### 4. `cat.ts` — Cat Profile

```ts
interface CatPhoto {
  url: string;
  caption?: string;
}

interface CatBehavior {
  energy: "low" | "medium" | "high";
  sociability: "reserved" | "moderate" | "outgoing";
  stressSensitivity: "low" | "moderate" | "high";
  handlingTolerance: "low" | "moderate" | "high";
  playNeeds: "low" | "moderate" | "high";
  noiseTolerance: "low" | "moderate" | "high";
  needsVerticalSpace: "low" | "moderate" | "high";
  comfortableWithChildren: "yes" | "no" | "unknown";
  comfortableWithCats: "yes" | "no" | "unknown";
  comfortableWithDogs: "yes" | "no" | "unknown";
  indoorOnlyRequired: boolean;
}

interface CatCare {
  knownMedicalNeeds: string;       // e.g. "None", "Dietary", "Chronic"
  medicationNeeds: string;          // e.g. "None", "Daily", "As needed"
  fivStatus: "positive" | "negative" | "unknown";
  specialNotes: string;
}

interface CatPersonality {
  trait: string;       // e.g. "Lap Cat", "Window Watcher"
  description: string; // Short description
}

interface Cat {
  id: string;
  name: string;
  breed: string;
  color: string;
  sex: string;
  age: number;
  lifeStage: "kitten" | "young" | "adult" | "senior";
  weight?: string;
  photo: string;
  photos?: CatPhoto[];
  status: "available" | "pending" | "adopted";
  vaccinated: boolean;
  microchipped: boolean;
  neutered: boolean;
  arrivalDate: string;
  daysInShelter?: number;
  adoptionFee?: number;
  shelterId: string;
  behavior: CatBehavior;
  personality: CatPersonality[];
  backstory?: string;
  idealHome?: string;
  care: CatCare;
}
```

**Firestore path**: `cats/{catId}`
**Data source**: `src/data/demoCats.ts`

---

### 5. `match.ts` — Compatibility Result

```ts
interface Concern {
  id: string;
  label: string;
  severity: "critical" | "moderate" | "minor";
  explanation: string;
}

interface Strength {
  id: string;
  label: string;
  explanation: string;
}

interface Mitigation {
  id: string;
  label: string;
  description: string;
}

interface CompatibilityResult {
  score: number;                // 0-100
  level: "excellent" | "good" | "moderate" | "challenging";
  concerns: Concern[];
  strengths: Strength[];
  mitigations: Mitigation[];
  explanation: string;          // AI-generated report
}

interface Match {
  id: string;
  catId: string;
  catName: string;
  catBreed: string;
  adopterId: string;
  createdAt: Timestamp;
  compatibility: CompatibilityResult;
  assessmentId: string;
}
```

**Firestore path**: `matches/{matchId}`
**Lifecycle**: Created after assessment completion; read by report page

---

### 6. `assessment.ts` — Assessment Session

```ts
type Recommendation = "adopt" | "consider_other" | "needs_review";

interface ScenarioAnswer {
  questionIndex: number;
  catTrait: string;
  selectedScore: number;
  selectedOption: string;
}

interface ScenarioQuestionOption {
  text: string;
  score: 0 | 1 | 3;
}

interface ScenarioQuestion {
  scenario: string;
  options: ScenarioQuestionOption[];
  catTrait: string;
}

interface AssessmentSession {
  catId: string;
  catName: string;
  lifestyleAnswers: Record<string, string>;
  scenarioAnswers: ScenarioAnswer[];
  questions: ScenarioQuestion[];     // dynamic (AI) or fallback
  completed: boolean;
  matchId?: string;
  expiresAt: Timestamp;              // TTL: 30 days
}

interface AssessmentRecord {
  id: string;
  catId: string;
  catName: string;
  completedAt: Timestamp;
  matchId: string;
  score: number;
  level: string;
}
```

**Firestore path**: Not persisted (client-side session). `AssessmentRecord` summaries stored in a user's history subcollection.

---

### 7. `checkIn.ts` — Daily Check-In

```ts
interface DailyCheckIn {
  id: string;
  userId: string;
  catId: string;
  date: Timestamp;
  mood: "happy" | "neutral" | "concerned";
  note: string;
  eatingNormal: boolean;
  litterNormal: boolean;
  behaviorNormal: boolean;
}
```

**Firestore path**: `checkIns/{checkInId}`
**Used by**: 14-day AI Coach

---

### 8. `coach.ts` — AI Coach Chat

```ts
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Timestamp;
  type?: "chat" | "alert" | "checkin_prompt";
}

interface CoachContext {
  userId: string;
  catId: string;
  catName: string;
  adoptionDate?: Timestamp;
  daySinceAdoption?: number;
  recentCheckIns: DailyCheckIn[];
}
```

**Firestore path**: Chats stored in a user subcollection
**API**: `/api/coach` (POST)

---

### 9. `shelter.ts` — Shelter

```ts
interface Shelter {
  id: string;
  name: string;
  location: { city: string; state: string; address: string; };
  description: string;
  email: string;
  phone: string;
  cats: number; // cat count
}

interface StaffInvitation {
  email: string;
  shelterId: string;
  role: ShelterRole;
  status: "pending" | "accepted" | "rejected";
  createdAt: Timestamp;
}
```

**Firestore path**: `shelters/{shelterId}`

---

### 10. `whiskerRunner.ts` — Game State

```ts
type GameStatus = "idle" | "running" | "paused" | "over";
type ObstacleType = "box" | "laser" | "vacuum" | "cucumber";

interface Obstacle {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

interface InputState {
  jumping: boolean;
  ducking: boolean;
}

interface GameState {
  status: GameStatus;
  score: number;
  highScore: number;
  catY: number;
  catVelocity: number;
  catWidth: number;
  catHeight: number;
  groundY: number;
  obstacles: Obstacle[];
  speedMultiplier: number;
  input: InputState;
}
```

**Constants**: Gravity, jump velocity, obstacle sizing — all in `src/types/whiskerRunner.ts`
**Leaderboard**: `leaderboard/{userId}` — `{ uid, displayName, photoURL, highScore, lastPlayed }`

---

### 11. `aiLog.ts` — AI Audit Log

```ts
type AISource = "gemini" | "fallback";

interface AILog {
  uid: string;
  catId: string;
  question: string;
  response: string;
  source: AISource;
  timestamp: Timestamp;
}

interface AILogInput {
  uid: string;
  catId: string;
  question: string;
  response: string;
  source: AISource;
}
```

**Firestore path**: `aiLogs/{logId}`
**API**: `/api/ai-logs`, `/api/saved` (GET/POST)

---

## Relationship Diagram

```
User (users/{uid})
 ├── adopterProfile/       AdopterProfile document
 ├── savedCats/            Wishlist (cat IDs)
 ├── checkIns/             14-day coach check-ins
 ├── matches (via adopterId)
 └── assessments (via userId)

Cat (cats/{catId})
 ├── shelter → Shelter (shelters/{shelterId})
 ├── matches (via catId)
 └── assessments (via catId)

Assessment → Match → CompatibilityResult
Coach → ChatMessage + DailyCheckIn → AI (/api/coach)
Leaderboard → WhiskerRunner scores
```

---

## API Endpoint Quick Reference

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/generate-questions` | POST | Optional | Generate AI scenario questions for a cat |
| `/api/counselor` | POST | Optional | Generate compatibility report |
| `/api/coach` | POST | Required | 14-day AI coach chat |
| `/api/escalation` | POST | Required | Medical escalation to vet |
| `/api/adoption-request` | POST | Required | Submit adoption request |
| `/api/assistant` | POST | Optional | General AI assistant |

---

## Data Lifecycle

| Data | Retention |
|---|---|
| Assessments | 30 days (client expiry) |
| Matches | Permanent (until user deletion) |
| AI Logs | Permanent (audit trail) |
| Check-ins | 30 days after coaching ends |
| Leaderboard | Permanent |

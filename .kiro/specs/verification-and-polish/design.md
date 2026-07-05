# Design Document: Verification and Polish

## Overview

This document defines the architecture, components, and correctness properties for the verification and polish phase of ForeverHome AI. The focus is on ensuring the compatibility engine, medical escalation system, AI coach, and daily check-in system function correctly through automated testing, while establishing manual verification procedures for UX and accessibility requirements.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ForeverHome AI System                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │   Assessment    │    │   AI Coach      │    │  Shelter Tools  │        │
│  │   Flow          │    │   System        │    │                 │        │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘        │
│           │                      │                      │                  │
│           ▼                      ▼                      ▼                  │
│  ┌─────────────────────────────────────────────────────────────────┐      │
│  │                     Core Libraries                               │      │
│  │  ┌───────────────────┐  ┌───────────────────┐  ┌─────────────┐ │      │
│  │  │ compatibilityEngine│  │medicalEscalation │  │ fallback    │ │      │
│  │  │ .ts               │  │.ts               │  │Explanations │ │      │
│  │  └───────────────────┘  └───────────────────┘  └─────────────┘ │      │
│  │  ┌───────────────────┐  ┌───────────────────┐  ┌─────────────┐ │      │
│  │  │ demoCats.ts       │  │ demoCheckIns.ts  │  │ gemini.ts   │ │      │
│  │  └───────────────────┘  └───────────────────┘  └─────────────┘ │      │
│  └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐      │
│  │                     Type Definitions                            │      │
│  │  cat.ts │ adopter.ts │ match.ts │ checkIn.ts │ coach.ts        │      │
│  └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Architecture

#### 1. Compatibility Engine (`src/lib/compatibilityEngine.ts`)

The compatibility engine is a pure function that evaluates cat-adopter matches based on 10 defined rules:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Compatibility Engine                          │
├─────────────────────────────────────────────────────────────────┤
│  Input: Cat, AdopterAnswers                                     │
│  Output: CompatibilityResult                                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Rule Evaluation Pipeline                │   │
│  │                                                          │   │
│  │  1. stress-noise     → significant if triggered         │   │
│  │  2. stress-children  → significant if triggered         │   │
│  │  3. energy-absence   → significant if triggered         │   │
│  │  4. vertical-space   → moderate if triggered            │   │
│  │  5. dog-incompatibility → significant if triggered      │   │
│  │  6. special-care     → significant if triggered         │   │
│  │  7. indoor-safety    → significant if triggered         │   │
│  │  8. unknown-compatibility → moderate if triggered       │   │
│  │  9. senior-cat-absence → significant if triggered       │   │
│  │  10. fiv-experience  → moderate if triggered            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Level Determination                     │   │
│  │                                                          │   │
│  │  significant >= 2  → level: "high"                       │   │
│  │  significant == 1  → level: "moderate"                   │   │
│  │  concerns == 0     → level: "low"                        │   │
│  │  moderate > 0      → level: "moderate"                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Alternative Recommendations                 │   │
│  │                                                          │   │
│  │  If level in ["high", "moderate"]:                       │   │
│  │    Find other cats with level "low"                      │   │
│  │    Return as alternativeCatIds                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 2. Medical Escalation Module (`src/lib/medicalEscalation.ts`)

A deterministic string-matching module for detecting emergency phrases:

```
┌─────────────────────────────────────────────────────────────────┐
│                  Medical Escalation Module                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Emergency Categories (25 phrases total):                       │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ Breathing (5)    │  │ Collapse (6)     │                    │
│  │ - trouble        │  │ - collapse       │                    │
│  │   breathing      │  │ - can't stand    │                    │
│  │ - struggling     │  │ - fell over      │                    │
│  │ - can't breathe  │  │ - collapsed      │                    │
│  │ - cannot breathe │  │ - not moving     │                    │
│  │ - difficulty     │  │ - unresponsive   │                    │
│  │   breathing      │  │                  │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ Seizures (3)     │  │ Bleeding (4)     │                    │
│  │ - seizure        │  │ - uncontrolled   │                    │
│  │ - fitting        │  │   bleeding       │                    │
│  │ - convulsing     │  │ - won't stop     │                    │
│  │ - convulsion     │  │   bleeding       │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ Poisoning (3)    │  │ Trauma (4)       │                    │
│  │ - poison         │  │ - hit by car     │                    │
│  │ - poisoned       │  │ - trauma         │                    │
│  │ - ate something  │  │ - broken         │                    │
│  │   toxic          │  │                  │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                 │
│  Function: isMedicalEmergency(message: string): boolean        │
│  - Case-insensitive matching                                   │
│  - Returns true if any phrase found in message                 │
│  - Returns false otherwise                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 3. AI Coach System

The AI coach combines deterministic fallback responses with optional Gemini AI integration:

```
┌─────────────────────────────────────────────────────────────────┐
│                        AI Coach System                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Request Flow:                                                  │
│                                                                 │
│  User Message                                                   │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────────┐                                           │
│  │ isMedicalEmergency│ → true → Return emergency response      │
│  └────────┬────────┘                                           │
│           │ false                                               │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ Gemini API Call │ → success → Return AI response            │
│  └────────┬────────┘                                           │
│           │ failure/null                                        │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ Fallback        │ → Return deterministic response           │
│  │ Response        │    with disclaimer                        │
│  └─────────────────┘                                           │
│                                                                 │
│  Response Types:                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Hiding Questions    → Contextual response with:         │   │
│  │                       - Cat name reference              │   │
│  │                       - Current day number              │   │
│  │                       - Check-in history summary        │   │
│  │                       - Actionable guidance             │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ Return Mentions     → Empathetic response with:         │   │
│  │                       - Acknowledgment of overwhelm     │   │
│  │                       - Shelter contact suggestion      │   │
│  │                       - Progress indicators             │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ Timeline Questions  → Phase-based guidance:             │   │
│  │                       - Days 1-3: Hiding normal         │   │
│  │                       - Days 4-7: Gradual exploration   │   │
│  │                       - Days 8-14: Confidence building  │   │
│  │                       - Weeks 2-4: Routine settling     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 4. Daily Check-In System

```
┌─────────────────────────────────────────────────────────────────┐
│                    Daily Check-In System                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Data Model:                                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ interface DailyCheckIn {                                │   │
│  │   adoptionId: string;    // Unique adoption identifier  │   │
│  │   day: number;           // Day number in transition    │   │
│  │   ate: boolean;          // Eating status               │   │
│  │   drank: boolean;        // Drinking status             │   │
│  │   hiding: boolean;       // Hiding status               │   │
│  │   litterUsed: boolean;   // Litter box usage            │   │
│  │   notes?: string;        // Optional observations       │   │
│  │   timestamp: string;     // ISO timestamp               │   │
│  │ }                                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Current Day Calculation:                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ if (checkIns.length === 0) {                            │   │
│  │   currentDay = 1;                                       │   │
│  │ } else {                                                │   │
│  │   currentDay = max(checkIns.map(c => c.day)) + 1;       │   │
│  │ }                                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  UI Components:                                                 │
│  - DailyCheckInComponent: Form for submitting check-ins        │
│  - ProgressTimeline: Chronological display of past check-ins   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### Core Library Components

| Component | File | Purpose | Testing Approach |
|-----------|------|---------|------------------|
| CompatibilityEngine | `src/lib/compatibilityEngine.ts` | Evaluates cat-adopter compatibility | Property-based tests for all 10 rules |
| MedicalEscalation | `src/lib/medicalEscalation.ts` | Detects emergency phrases | Property-based tests for 25 phrases |
| FallbackExplanations | `src/lib/fallbackExplanations.ts` | Provides deterministic coach responses | Unit tests for response generation |
| DemoCats | `src/data/demoCats.ts` | Six sample cat profiles | Data validation tests |
| DemoCheckIns | `src/data/demoCheckIns.ts` | Sample check-in history | Integration tests |

### Page Components

| Component | File | Purpose | Testing Approach |
|-----------|------|---------|------------------|
| AssessmentPage | `src/app/assessment/[catId]/page.tsx` | Multi-step adopter questionnaire | Integration tests, E2E tests |
| CoachPage | `src/app/coach/[adoptionId]/page.tsx` | AI coach chat interface | Integration tests, accessibility tests |
| ShelterInsightsPage | `src/app/shelter/insights/page.tsx` | Shelter analytics dashboard | Visual verification, demo data indicator |

### UI Components

| Component | File | Purpose |
|-----------|------|---------|
| DailyCheckIn | `src/components/coach/DailyCheckIn.tsx` | Check-in form with toggles |
| ProgressTimeline | `src/components/coach/ProgressTimeline.tsx` | Chronological check-in display |
| ChatBubble | `src/components/coach/ChatBubble.tsx` | Message display component |
| MedicalEscalation | `src/components/coach/MedicalEscalation.tsx` | Emergency warning display |
| EmergencyContacts | `src/components/coach/EmergencyContacts.tsx` | Emergency vet contact info |

## Interfaces

### Type Definitions

```typescript
// src/types/cat.ts
interface CatBehavior {
  energy: "low" | "medium" | "high";
  sociability: "reserved" | "moderate" | "outgoing";
  stressSensitivity: "low" | "moderate" | "high";
  handlingTolerance: "low" | "moderate" | "high";
  playNeeds: "low" | "moderate" | "high";
  comfortableWithChildren: "yes" | "no" | "unknown";
  comfortableWithCats: "yes" | "no" | "unknown";
  comfortableWithDogs: "yes" | "no" | "unknown";
  noiseTolerance: "low" | "moderate" | "high";
  needsVerticalSpace: "low" | "moderate" | "high";
  indoorOnlyRequired: boolean;
}

interface CatCare {
  knownMedicalNeeds: string;
  medicationNeeds: string;
  fivStatus: "negative" | "positive" | "unknown";
  specialNotes: string;
}

interface Cat {
  id: string;
  name: string;
  age: number;
  lifeStage: "kitten" | "young" | "adult" | "senior";
  sex: "male" | "female";
  neutered: boolean;
  photo: string;
  status: "available" | "adopted" | "pending";
  behavior: CatBehavior;
  care: CatCare;
}

// src/types/adopter.ts
interface Child {
  ageRange: "0-4" | "5-9" | "10-14" | "15+";
}

interface ExistingPets {
  cats: number;
  dogs: number;
}

interface AdopterAnswers {
  homeType: "house" | "apartment" | "condo" | "other";
  adultsInHome: number;
  children: Child[];
  existingPets: ExistingPets;
  householdNoise: "low" | "moderate" | "high";
  hoursAway: number;
  travelFrequency: "rare" | "occasional" | "frequent";
  previousCatExperience: boolean;
  specialNeedsExperience: boolean;
  canProvideVerticalSpace: boolean;
  indoorSafety: "secure" | "partial" | "unsure";
  veterinaryAccess: "yes" | "no" | "unsure";
  comfortableWithRoutineCare: boolean;
  scenarioAnswers: string[];
}

// src/types/match.ts
interface Concern {
  ruleId: string;
  severity: "significant" | "moderate";
  description: string;
  triggeredBy: string;
}

interface Strength {
  description: string;
}

interface Mitigation {
  description: string;
}

interface CompatibilityResult {
  level: "low" | "moderate" | "high";
  concerns: Concern[];
  strengths: Strength[];
  mitigations: Mitigation[];
  requiresShelterReview: boolean;
  alternativeCatIds: string[];
}

// src/types/checkIn.ts
interface DailyCheckIn {
  adoptionId: string;
  day: number;
  ate: boolean;
  drank: boolean;
  hiding: boolean;
  litterUsed: boolean;
  notes?: string;
  timestamp: string;
}
```

### API Interfaces

```typescript
// POST /api/coach
interface CoachRequest {
  message: string;
  catName: string;
  catProfile?: string;
  currentDay: number;
  checkIns?: DailyCheckIn[];
}

interface CoachResponse {
  response: string;
  source: "gemini" | "fallback" | "deterministic";
  isEmergency?: boolean;
  disclaimer?: string;
}
```

## Data Models

### Demo Cat Data

The system includes six demo cats with distinct profiles designed to test different compatibility scenarios:

| ID | Name | Life Stage | Key Characteristics | Primary Test Scenario |
|----|------|------------|---------------------|----------------------|
| barnaby | Barnaby | Adult (6) | High stress sensitivity, not comfortable with children, indoor-only | stress-noise, stress-children rules |
| luna | Luna | Adult (3) | Low stress, outgoing, comfortable with all | Ideal first-time cat |
| milo | Milo | Young (1) | High energy, needs vertical space, unknown compatibility | energy-absence, vertical-space rules |
| shadow | Shadow | Senior (11) | Arthritis, low energy, not comfortable with dogs | senior-cat-absence, special-care rules |
| pepper | Pepper | Young (1) | High energy, outgoing, needs enrichment | energy-absence rule |
| mochi | Mochi | Adult (5) | FIV+, selective with cats | fiv-experience rule |

### Demo Check-In Data

Sample check-in data demonstrates a typical transition progression:

```
Day 1: Hiding, eating, drinking, using litter box
Day 2: Hiding, brief exploration
Day 3: Hiding, ate treats from hand
Day 5: No longer hiding, slept on bed
Day 7: Playing, accepts petting
Day 10: Sitting on couch, settled
```

## Error Handling

### Error Categories and Responses

| Error Type | Trigger | System Response |
|------------|---------|-----------------|
| Medical Emergency | Emergency phrase detected | Display emergency banner, show emergency contacts |
| Gemini API Failure | API timeout or error | Return fallback response with disclaimer |
| Invalid Cat ID | Cat not found in database | Display "Cat not found" message with navigation |
| Incomplete Assessment | Missing required fields | Disable "Next" button, highlight incomplete fields |
| Empty Chat Input | Input is empty or whitespace | Disable send button |
| Network Error | API call fails | Display user-friendly error message, enable retry |

### Fallback Response Strategy

```typescript
// When Gemini is unavailable
function getCoachFallbackResponse(
  question: string,
  catName: string,
  currentDay: number
): string {
  return `Thank you for reaching out about ${catName}. While our AI counselor 
  is currently unavailable, here is some general guidance:
  
  You are on Day ${currentDay} of the transition period. It's completely 
  normal for cats to take time to adjust to a new home.
  
  If you have concerns about ${catName}'s health or behavior, please 
  contact your shelter or veterinarian directly.`;
}
```

## Testing Strategy

### Property-Based Testing Approach

Property-based testing will be used for pure functions with clear input/output relationships:

1. **Compatibility Engine**: Test all 10 compatibility rules with generated cat-adopter pairs
2. **Medical Escalation**: Test all 25 emergency phrases with generated messages
3. **AI Coach Response**: Test contextual response generation with various inputs
4. **Check-In Logic**: Test day calculation and data persistence

### Unit Testing Approach

Unit tests will cover:
- Individual compatibility rule evaluation
- Emergency phrase detection
- Fallback response generation
- Data validation for demo cats

### Integration Testing Approach

Integration tests will cover:
- Assessment flow from start to match report
- Check-in save and retrieval
- Coach chat with emergency detection
- Demo cat retrieval and compatibility results

### Manual Verification Approach

Manual verification procedures will cover:
- Mobile responsiveness at 375px, 768px, 1024px viewports
- Keyboard navigation through all pages
- Screen reader testing with VoiceOver and NVDA
- Visual verification of all cat images with alt text
- Complete adopter assessment flow
- Shelter staff workflow

## Mobile Responsiveness Design

### Breakpoint Strategy

| Breakpoint | Width | Layout Behavior |
|------------|-------|-----------------|
| Mobile | 375px | Single-column, stacked layouts, visible chat interface |
| Tablet | 768px | Adaptive layouts between mobile and desktop |
| Desktop | 1024px+ | Multi-column layouts, full sidebar visible |

### Responsive Components

1. **Assessment Form**: Stack questions vertically, ensure 44px minimum touch targets
2. **Coach Chat**: Maintain visible input field and send button at all widths
3. **Cat Profile**: Hidden on mobile, sticky sidebar on desktop
4. **Check-In Toggles**: 2-column grid on mobile, maintain usability

## Accessibility Design

### WCAG 2.1 Level AA Compliance

1. **Keyboard Navigation**: All interactive elements focusable and operable via keyboard
2. **Screen Reader Support**: Meaningful alt text, proper ARIA labels, live regions for chat
3. **Color Contrast**: 4.5:1 for normal text, 3:1 for large text
4. **Non-Color Indicators**: Risk levels conveyed through both color and text/icons
5. **Focus Indicators**: Visible focus states on all interactive elements
6. **Form Labels**: All inputs have associated labels via HTML or aria-label

### Accessibility Test Cases

1. Tab navigation through complete assessment flow
2. Screen reader announcement of new chat messages
3. Alt text verification for all cat photos
4. Color contrast verification for risk level indicators
5. Button and link accessible name verification

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Compatibility Level Validity

*For any* cat and adopter pair processed by the compatibility engine, the returned result level shall be one of "low", "moderate", or "high".

**Validates: Requirements 1.1**

### Property 2: Stress-Noise Rule Application

*For any* cat with `behavior.stressSensitivity === "high"` and any adopter with `householdNoise === "high"`, the compatibility engine shall generate a concern with `ruleId === "stress-noise"` and `severity === "significant"`.

**Validates: Requirements 1.2**

### Property 3: Stress-Children Rule Application

*For any* cat with `behavior.comfortableWithChildren === "no"` and any adopter with children in age ranges "0-4" or "5-9", the compatibility engine shall generate a concern with `ruleId === "stress-children"` and `severity === "significant"`.

**Validates: Requirements 1.3**

### Property 4: Indoor-Safety Rule Application

*For any* cat with `behavior.indoorOnlyRequired === true` and any adopter with `indoorSafety !== "secure"`, the compatibility engine shall generate a concern with `ruleId === "indoor-safety"` and `severity === "significant"`.

**Validates: Requirements 1.4**

### Property 5: FIV-Experience Rule Application

*For any* cat with `care.fivStatus === "positive"` and any adopter with `previousCatExperience === false` AND `specialNeedsExperience === false`, the compatibility engine shall generate a concern with `ruleId === "fiv-experience"` and `severity === "moderate"`.

**Validates: Requirements 1.5**

### Property 6: High Concern Level Determination

*For any* compatibility result where the count of concerns with `severity === "significant"` is greater than or equal to 2, the result level shall be "high".

**Validates: Requirements 1.6**

### Property 7: Moderate Concern Level Determination

*For any* compatibility result where the count of concerns with `severity === "significant"` equals 1, the result level shall be "moderate".

**Validates: Requirements 1.7**

### Property 8: Low Concern Level Determination

*For any* compatibility result where the concerns array is empty, the result level shall be "low".

**Validates: Requirements 1.8**

### Property 9: Alternative Recommendations

*For any* compatibility result where level is "high" or "moderate", the `alternativeCatIds` array shall contain at least one cat ID, and checking that cat with the same adopter shall yield a result with level "low".

**Validates: Requirements 1.9**

### Property 10: Emergency Phrase Detection

*For any* user message containing any of the 25 emergency phrases (case-insensitive), the `isMedicalEmergency` function shall return `true`.

**Validates: Requirements 2.1, 2.4**

### Property 11: Non-Emergency Message Handling

*For any* user message that does not contain any of the 25 emergency phrases, the `isMedicalEmergency` function shall return `false`.

**Validates: Requirements 2.5**

### Property 12: Coach Response Context Integration

*For any* hiding-related question sent to the AI coach with a valid cat name and check-in history, the response shall reference the cat's name, the current day number, and incorporate patterns from the check-in history.

**Validates: Requirements 3.1, 3.4**

### Property 13: Return Mention Response

*For any* message containing the word "return" or similar intent about giving back the cat, the coach response shall acknowledge feelings of overwhelm and suggest contacting the shelter before making decisions.

**Validates: Requirements 3.2**

### Property 14: Timeline Response Structure

*For any* question about adjustment timeline or "how long" it takes for a cat to adjust, the coach response shall include guidance for Days 1-3, Days 4-7, Days 8-14, and Weeks 2-4.

**Validates: Requirements 3.3**

### Property 15: Fallback Response Mechanism

*For any* coach request where the Gemini API returns null or throws an error, the system shall return a response from the fallback explanations module with `source === "fallback"`.

**Validates: Requirements 3.5, 11.1**

### Property 16: Fallback Disclaimer

*For any* coach response where `source === "fallback"`, the response shall include a disclaimer indicating the response was generated without AI.

**Validates: Requirements 3.6**

### Property 17: Check-In Data Completeness

*For any* check-in saved by the system, the saved object shall contain all required fields: `adoptionId`, `day`, `timestamp`, `ate`, `drank`, `hiding`, `litterUsed`, and optionally `notes`.

**Validates: Requirements 4.1**

### Property 18: Current Day Calculation

*For any* array of existing check-ins, the current day shall be calculated as `max(checkIns.map(c => c.day)) + 1`. When the array is empty, the current day shall be 1.

**Validates: Requirements 4.2, 4.4**

### Property 19: Demo Cat Data Completeness

*For each* cat in the demo cats array, the cat object shall contain all required fields: `id`, `name`, `age`, `lifeStage`, `sex`, `neutered`, `photo`, `status`, `behavior` object, and `care` object.

**Validates: Requirements 5.2**

### Property 20: Demo Cat Behavior Completeness

*For each* cat in the demo cats array, the `behavior` object shall contain all compatibility-relevant fields with valid values from their respective enums.

**Validates: Requirements 5.3**

### Property 21: Demo Cat Care Completeness

*For each* cat in the demo cats array, the `care` object shall contain `knownMedicalNeeds`, `medicationNeeds`, `fivStatus`, and `specialNotes` fields.

**Validates: Requirements 5.4**

### Property 22: Invalid Cat ID Handling

*For any* cat ID not in the set of valid IDs {barnaby, luna, milo, shadow, pepper, mochi}, the `getCatById` function shall return `undefined`.

**Validates: Requirements 5.6**

### Property 23: Image Alt Text Presence

*For any* image element rendering a cat photo or informational image, the element shall have a non-empty `alt` attribute.

**Validates: Requirements 8.2**

### Property 24: Form Label Association

*For any* form input element, the input shall have an associated label via either a wrapping `<label>` element, a `htmlFor` attribute matching the input `id`, or an `aria-label` attribute.

**Validates: Requirements 8.3**

### Property 25: Button Accessible Name

*For any* button or link element, the element shall have a discernible accessible name via text content, `aria-label`, or `aria-labelledby`.

**Validates: Requirements 8.7**

### Property 26: Empty Input Disables Send

*For any* chat input state where the trimmed input value is empty, the send button shall be disabled.

**Validates: Requirements 11.4**

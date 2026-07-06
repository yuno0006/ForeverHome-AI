# ForeverHome AI — Architecture

## System Overview

ForeverHome AI is a Next.js 16 (App Router) full-stack application that helps shelters prevent cat returns through pre-adoption compatibility assessment and post-adoption education.

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                         CLIENT                                │
│        Next.js 16 App Router + React 19 + Tailwind CSS v4      │
│                                                                │
│  ┌────────────┐  ┌────────────────┐  ┌─────────────────────┐  │
│  │ Cat Browse  │  │  10-Question   │  │  Compatibility      │  │
│  │ (9 profiles)│─▶│  Assessment    │─▶│  Report + AI        │  │
│  │             │  │  Quiz          │  │  + TTS + Alt Cats   │  │
│  └────────────┘  └────────────────┘  └─────────────────────┘  │
│                                                    │          │
│  ┌─────────────────────────────────────────────┐   │          │
│  │              14-Day AI Coach                 │◀──┘          │
│  │  ┌──────────┐ ┌──────────┐ ┌─────────────┐  │              │
│  │  │ Daily    │ │ 9 Lives  │ │ Mr. Cat     │  │              │
│  │  │ Check-ins│ │ Protocol │ │ AI Chat     │  │              │
│  │  └──────────┘ └──────────┘ │ (photo too) │  │              │
│  │                            └─────────────┘  │              │
│  │  ┌──────────────────────────────────────┐   │              │
│  │  │        Smart Escalation              │   │              │
│  │  │  (Priority ticket → shelter staff)   │   │              │
│  │  └──────────────────────────────────────┘   │              │
│  └─────────────────────────────────────────────┘              │
│                                                                │
│  ┌──────────────────┐  ┌─────────────────────────────────┐    │
│  │ Shelter Insights  │  │ Whisker Runner Game             │    │
│  │ (Patterns, stats) │  │ (Canvas endless runner + PWA)   │    │
│  └──────────────────┘  └─────────────────────────────────┘    │
├──────────────────────────────────────────────────────────────┤
│                        SERVER                                 │
│          Next.js API Route Handlers (server-side only)        │
│                                                                │
│  ┌──────────────────────┐  ┌───────────────────────────────┐ │
│  │ Gemini AI (v1beta)    │  │ Firebase Auth + Firestore     │ │
│  │ • 3-tier model chain  │  │ • 10 collections RBAC        │ │
│  │ • Rate-limit fallback │  │ • jose JWKS verification     │ │
│  │ • 8s timeout per call │  │ • aiLogs (write-only)        │ │
│  │ • Image input support │  │ • UID-enforced isolation     │ │
│  └──────────────────────┘  └───────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │                   Security Layer                          ││
│  │  • Medical keywords scan (26 phrases, deterministic)      ││
│  │  • Firebase ID token verification (all protected routes)  ││
│  │  • UID matching (caller.uid === requested.uid)            ││
│  │  • Field type + size validation (Firestore rules)         ││
│  │  • Dependency CVE overrides (serialize-javascript, etc.)  ││
│  └──────────────────────────────────────────────────────────┘│
├──────────────────────────────────────────────────────────────┤
│                    CORE ENGINE (Client)                        │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Compatibility Assessment Engine                       │  │
│  │  • 10 deterministic rules (no AI for matching)         │  │
│  │  • 3 risk tiers: Low / Moderate / High                 │  │
│  │  • Alternative cat auto-recommendations                │  │
│  │  • Non-recursive alt-finding (stack-safe)              │  │
│  │  • Property-tested with fast-check                     │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Medical Escalation Layer                               │  │
│  │  • 26 emergency keywords (case-insensitive)             │  │
│  │  • Intercepts BEFORE any AI API call                    │  │
│  │  • Immediate deterministic response                     │  │
│  │  • Permanent emergency contact UI visible               │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. Deterministic Compatibility Engine (No AI)

The compatibility assessment uses 10 fixed rules — no machine learning, no black-box AI. This is intentional:
- **Transparency**: Shelters and adopters see exactly why a concern was flagged
- **Consistency**: Same inputs always produce the same results
- **Safety**: No hallucination risk in matching decisions
- **Auditability**: Any shelter can verify the logic

AI is used only to **explain** the structured results — generating warm, context-aware narratives from deterministic data, never making the matching decision itself.

### 2. Server-Side AI Only

All Gemini API calls happen in Next.js API routes (`src/app/api/`), never in the browser. API keys are never exposed to the client. The client sends messages to the route, which calls Gemini server-side and returns the response.

**AI Endpoints**:
- `POST /api/counselor` — Compatibility report explanation
- `POST /api/coach` — 14-Day coach conversations
- `POST /api/assistant` — General site assistant (Mr. Cat)

**Model Failover Chain**:
```
gemini-3.5-flash → (429? → gemini-3.5-flash-lite)
→ gemini-3-flash-preview → (429? → gemini-3-flash-lite-preview)
→ gemini-2.5-flash → (429? → gemini-2.5-flash-lite)
→ deterministic fallback response
```

### 3. Deterministic Medical Safety Layer

Before any AI call, messages are scanned for 26 emergency keywords (e.g., "not breathing", "seizure", "blood"). If detected, the system immediately returns a medical emergency response without ever calling the AI. This is a deterministic fail-safe — defense-in-depth that prevents AI hallucination from ever affecting a medical situation.

### 4. Demo-First Development

The entire application works without Firebase credentials by default, using sessionStorage and static demo data (`src/data/demoCats.ts`). This enables instant judge review without setup.

### 5. Privacy-First AI Logging

All AI interactions are logged to a write-only Firestore `aiLogs` collection:
- Users cannot read their own logs (or anyone else's)
- No full conversation context stored (question + response + metadata only)
- Logs are immutable (no updates or deletes)
- Admin access only via Cloud Functions
- In demo mode, stored in sessionStorage (auto-cleared on tab close)

## Data Flow

### Assessment Flow
```
User → Browse Cats → Select Cat → 5 Lifestyle Questions
  → 5 Scenario Questions → Compatibility Engine (client-side)
  → Compatibility Report (risk level + triggered rules + mitigations)
  → Optional: AI Counselor Explanation (server-side API)
  → Alternative Cat Recommendations (if moderate/high risk)
```

### Coach Flow
```
Adopter → Daily Check-in (4 toggles + note)
  → AI Coach Chat (message + optional photo)
  → POST /api/coach → Medical Keywords Check (deterministic)
  → If EMERGENCY: immediate vet advisory response
  → If SAFE: Gemini API with cat profile + check-in history → Response
  → AI Interaction Logged (aiLogs, fire-and-forget)
  → Escalation: SmartEscalationModal → POST /api/escalation
```

### Adoption Request Flow
```
Compatibility Report → "Start Adoption Process"
  → Fill contact form → POST /api/adoption-request
  → Shelter phone/email/address displayed immediately
  → Shelter staff reviews in /shelter/adoptions dashboard
```

## Database Schema

### Firestore Collections

| Collection | Path | Access | Purpose |
|-----------|------|--------|---------|
| `cats` | `/cats/{catId}` | Public read, Admin write | Cat profiles |
| `users` | `/users/{uid}` | Self read/write | User account data |
| `adopterProfile` | `/users/{uid}/adopterProfile/{uid}` | Self read/write | Adopter profiles |
| `meta` | `/users/{uid}/meta/{docId}` | Self read/write | Wishlist, preferences |
| `assessments` | `/assessments/{id}` | Self read/create (adopterUid) | Compatibility assessments |
| `adoptions` | `/adoptions/{id}` | Self read, Admin write | Active adoptions + check-ins |
| `matches` | `/matches/{id}` | Self read | Compatibility results |
| `aiLogs` | `/aiLogs/{id}` | Create only (users), Admin read | AI interaction logs |
| `escalationReports` | `/escalationReports/{id}` | Shelter owner read, Field-validated create | Priority reports |
| `adoptionRequests` | `/adoptionRequests/{id}` | Shelter owner read/update, Field-validated create | Adoption requests |
| `shelters` | `/shelters/{shelterId}` | Public read, Admin create/update | Shelter profiles |
| `shelterReviews` | `/shelterReviews/{id}` | Public read, Author create/update | Shelter reviews |

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router, Turbopack) | 16.2.9 |
| Language | TypeScript (strict mode) | 5.x |
| UI Library | React | 19.2.4 |
| Styling | Tailwind CSS | v4 |
| Components | shadcn/ui + custom CatElements | 4.11.1 |
| Auth | Firebase Authentication | 12.15.0 |
| Database | Cloud Firestore | 12.15.0 |
| AI | Google Gemini API (v1beta) | — |
| Token Verification | jose | 6.2.3 |
| Animation | Framer Motion | 12.42.2 |
| PWA | @ducanh2912/next-pwa | 10.2.9 |
| Testing | Vitest + fast-check | 4.1.9 + 4.8.0 |
| Linting | ESLint (next/core-web-vitals) | 9.x |
| Validation | zod | 4.4.3 |
| Notifications | sonner | 2.0.7 |
| Confetti | canvas-confetti | 1.9.4 |
| Lottie | lottie-react | 2.4.1 |
| Hosting | Vercel | — |

## Project Structure

```
src/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout (PWA, fonts, theme)
│   ├── page.tsx                      # Landing page
│   ├── globals.css                   # Tailwind v4 + design tokens
│   ├── api/                          # Server-side route handlers
│   │   ├── coach/route.ts            # AI coach (with medical safety check)
│   │   ├── counselor/route.ts        # AI counselor (compatibility report)
│   │   ├── assistant/route.ts        # General AI assistant (Mr. Cat)
│   │   ├── escalation/route.ts       # Smart escalation (human handoff)
│   │   ├── adoption-request/route.ts # Adoption request submission
│   │   └── saved/route.ts            # Wishlist CRUD (GET/POST/DELETE)
│   ├── cats/                         # Cat browsing + profiles
│   ├── assessment/[catId]/           # 10-question compatibility quiz
│   ├── report/[matchId]/             # Compatibility report + AI + TTS
│   ├── coach/                        # 14-Day AI Coach
│   │   ├── page.tsx                  # Coach index (no adoption)
│   │   └── [adoptionId]/page.tsx     # Specific cat's coach
│   ├── dashboard/                    # Adopter dashboard
│   ├── saved/                        # Wishlist
│   ├── insights/                     # Public shelter insights
│   ├── outcome/                      # With/without ForeverHome story
│   ├── shelter/                      # Shelter staff console
│   │   ├── dashboard/                # Overview + stats
│   │   ├── cats/                     # Cat inventory CRUD
│   │   ├── adoptions/                # Request tracking
│   │   ├── insights/                 # Concern patterns + analytics
│   │   └── staff/                    # Staff management
│   ├── about/                        # Architecture overview
│   ├── login/                        # Sign in (XSS fixed)
│   ├── register/                     # Sign up
│   ├── onboarding/                   # Role + profile setup
│   └── profile/                      # User profile
├── components/
│   ├── Providers.tsx                 # Auth + Toaster + Theme wrapper
│   ├── CatBackground.tsx             # Animated background pattern
│   ├── auth/AuthGuard.tsx            # Route protection (auth + role + onboarding)
│   ├── layout/Header.tsx             # Nav, wishlist count, mobile drawer
│   ├── coach/                        # Chat, CheckIn, Timeline, Escalation
│   ├── report/                       # Badge, Concerns, Mitigations, AltCats
│   ├── assessment/                   # Questions, Progress, Scenario
│   ├── insights/                     # CatsNeedingAttention, CommonConcerns
│   ├── game/                         # WhiskerRunner game + sprite components
│   ├── cats/                         # CatCard, CatProfile
│   └── ui/                           # shadcn components + CatElements
├── lib/
│   ├── compatibilityEngine.ts        # 10-rule deterministic engine
│   ├── medicalEscalation.ts          # 26 emergency keywords
│   ├── gemini.ts                     # Gemini API (3-tier failover, image input)
│   ├── aiLoggingService.ts           # Write-only AI log
│   ├── verifyAuthToken.ts            # Firebase ID token verification (jose/JWKS)
│   ├── firebase.ts                   # Firebase config + initialization
│   ├── firestoreService.ts           # Database CRUD operations
│   └── whiskerRunner/                # Game engine, RNG, high scores
├── data/
│   ├── demoCats.ts                   # 9 detailed cat profiles
│   └── nineLivesProtocol.ts          # 9 Lives curriculum (days 1-14)
├── types/                            # TypeScript interfaces
│   ├── cat.ts                        # Cat schema (13 behavioral fields)
│   ├── adopter.ts                    # Adopter schema (13 lifestyle fields)
│   ├── match.ts                      # Compatibility result schema
│   └── aiLog.ts                      # AI log entry schema
└── __tests__/                        # Integration + property tests
    ├── setup.ts                      # Shared fixtures (6 cats, 5 adopters)
    ├── accessibility.property.test.ts
    └── error-handling.test.ts
```

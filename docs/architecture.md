# ForeverHome AI — Architecture

## System Overview

ForeverHome AI is a Next.js 16 (App Router) full-stack application that helps shelters prevent cat returns through pre-adoption compatibility assessment and post-adoption education.

## Architecture Diagram

```
┌──────────────────────────────────────────────┐
│                   CLIENT                      │
│  Next.js App Router + React + Tailwind CSS    │
│  ┌─────────┐ ┌─────────┐ ┌────────────────┐  │
│  │ Cat      │ │Assessment│ │Compatibility   │  │
│  │ Browsing │─▶ Quiz    │─▶ Report         │  │
│  └─────────┘ └─────────┘ └────────────────┘  │
│                       │                       │
│  ┌────────────────────────────────────────┐   │
│  │          14-Day AI Coach                │   │
│  │  ┌────────┐ ┌────────┐ ┌────────────┐  │   │
│  │  │Check-in│ │Timeline│ │AI Chat     │  │   │
│  │  └────────┘ └────────┘ └────────────┘  │   │
│  └────────────────────────────────────────┘   │
│                       │                       │
│  ┌────────────────┐ ┌────────────────────┐    │
│  │Shelter Insights│ │Smart Escalation    │    │
│  └────────────────┘ └────────────────────┘    │
└──────────────────────────────────────────────┘
                        │
┌──────────────────────────────────────────────┐
│                  SERVER                       │
│  Next.js API Routes (server-side only)        │
│  ┌─────────────┐ ┌───────────────────────┐    │
│  │Gemini AI    │ │Firebase Auth +        │    │
│  │(Coach +     │ │Firestore DB +         │    │
│  │ Counselor)  │ │aiLogs Collection      │    │
│  └─────────────┘ └───────────────────────┘    │
│  ┌──────────────────────────────────────────┐ │
│  │        Security Layer                     │ │
│  │  - Firebase ID Token Verification         │ │
│  │  - Medical Escalation (deterministic)     │ │
│  │  - Rate-limited API keys                  │ │
│  └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
                        │
┌──────────────────────────────────────────────┐
│              CORE ENGINE (Client)              │
│  ┌──────────────────────────────────────────┐ │
│  │  Compatibility Assessment Engine         │ │
│  │  - 9+ deterministic rules                │ │
│  │  - No AI for core decisions              │ │
│  │  - Alternative cat recommendations       │ │
│  └──────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────┐ │
│  │  Medical Escalation Layer                │ │
│  │  - 26 emergency keywords                 │ │
│  │  - Intercepts BEFORE AI call             │ │
│  │  - Routes to human/vet immediately       │ │
│  └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. Deterministic Compatibility Engine (No AI)

The compatibility assessment uses 9+ fixed rules — no machine learning, no black-box AI. This is intentional:
- **Transparency**: Shelters and adopters see exactly why a concern was flagged
- **Consistency**: Same inputs always produce the same results
- **Safety**: No hallucination risk in matching decisions

### 2. Server-Side AI Only

All Gemini API calls happen in Next.js API routes (`src/app/api/`), never in the browser. API keys are never exposed to the client. The client sends messages to the route, which calls Gemini server-side and returns the response.

### 3. Deterministic Medical Safety Layer

Before any AI call, messages are scanned for 26 emergency keywords (e.g., "not breathing", "seizure", "blood"). If detected, the system immediately returns a medical emergency response without ever calling the AI. This is a deterministic fail-safe.

### 4. Demo-First Development

The entire application works without Firebase credentials by default, using sessionStorage and static demo data (`src/data/demoCats.ts`). This enables instant judge review without setup.

## Data Flow

### Assessment Flow
```
User → Select Cat → Answer 5 Scenario Questions
  → Compatibility Engine (client-side)
  → Compatibility Report (triggered rules + alternatives)
  → Optional: AI Counselor explanation (server-side API)
```

### Coach Flow
```
Adopter → Daily Check-in (4 toggles + note)
  → AI Coach Chat
  → Message → API Route → Medical Keywords Check (deterministic)
  → If safe: Gemini API → Response
  → AI Interaction Logged (aiLogs collection, fire-and-forget)
  → Smart Escalation: Human handoff if needed
```

## Database Schema

### Firestore Collections
| Collection | Path | Purpose |
|---|---|---|
| `cats` | `/cats/{catId}` | Cat profiles |
| `users` | `/users/{uid}/adopterProfile/{uid}` | Adopter profiles |
| `assessments` | `/assessments/{id}` | Compatibility assessments (auto-expire 30d) |
| `adoptions` | `/adoptions/{id}` | Active adoptions + check-ins |
| `matches` | `/matches/{id}` | Compatibility results |
| `aiLogs` | `/aiLogs/{id}` | AI interaction logs (write-only) |

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 + custom design system |
| Components | shadcn/ui + custom CatElements |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| AI | Google Gemini API (v1beta) |
| PWA | @ducanh2912/next-pwa |
| Testing | Vitest + fast-check (property-based) |
| Animation | Framer Motion |
| Hosting | Vercel |

# Kiro Persistent Memories — ForeverHome AI

Kiro maintained these key pieces of context across development sessions, enabling consistent, informed code generation without re-exploring the codebase.

---

## Session 1: Project Scaffold & Auth

**Memory ID: `auth-flow`**
- Auth uses Firebase `onAuthStateChanged` listener in `AuthContext`
- Flow: Login → Onboarding (role + 12 fields) → Dashboard (adopter) or Shelter Dashboard (staff)
- `OnboardingGuard` wraps all layouts, redirects to `/onboarding` if `onboardingComplete: false`
- `AuthGuard` is per-page, supports `requiredRole` prop
- Login page has guest skip link to `/assessment/barnaby`

## Session 2: Gemini AI Integration

**Memory ID: `gemini-rotation`**
- Two API keys, parallel race strategy (all model×key combos fire simultaneously)
- API base: `https://generativelanguage.googleapis.com/v1beta/models/`
- Listing AI: 6 combos race at once (gemini-3.5-flash, gemini-3-flash-preview, gemini-2.5-flash × Key1, Key2)
- Chat AI: 4 combos race at once (gemini-3.1-flash-lite, gemini-2.5-flash × Key1, Key2)
- Rate-limit cache: HTTP 429 → 90s cooldown per (model, key) combo. All exhausted → sleep until next expiry
- No free-quota models in rotation

## Session 3: Compatibility Engine

**Memory ID: `compatibility-rules`**
- 10 deterministic rules, each with configurable weight
- Rules include: energy match, children compatibility, other pets, alone time, space requirements, allergy, experience level, grooming tolerance, noise sensitivity, age preference
- Score normalized to 0-100
- "More compatible cats" algorithm: re-score all 9 cats, sort descending, return top 3 excluding current
- AI explains the match but never decides it

## Session 4: Design System

**Memory ID: `cat-theme`**
- Primary: terracotta `#E07A5F` (`bg-heart`, `text-heart`)
- Dark: `#3D2C2E` (`bg-cat-dark`, `text-cat-dark`)
- Accent: sunny `#F4D06F` (`bg-sunny`, `text-sunny`)
- Background: warm-cream `#FFF8F0` (`bg-warm-cream`)
- Font: Nunito (imported from Google Fonts)
- Rounded corners: `rounded-xl` or `rounded-2xl` for cards
- Shadows: soft, warm-toned (`shadow-md`, `shadow-lg`)
- Cat emoji/mascot: `cat.png` as app icon, used throughout

## Session 5: PWA Support

**Memory ID: `pwa-config`**
- Library: `@ducanh2912/next-pwa`
- Service worker: auto-generated, offline caching of static assets
- Manifest: `/manifest.json` (name: "ForeverHome AI", theme: terracotta)
- Icons: 192px, 512px PNG
- Install prompt: custom UI shown after cat profile visit

## Session 6: Security Fixes

**Memory ID: `security-remediations`**
- Aikido found 9 issues, all remediated
- CSP headers in `next.config.ts`: allow `apis.google.com`, `accounts.google.com` for Firebase Auth popup
- X-Frame-Options: DENY, X-Content-Type-Options: nosniff
- Path traversal fixed: input validation on all dynamic route params
- Dependencies updated: no CVEs remain
- Firebase security rules enforce ownership + role-based access

## Session 7: Whisker Runner Game

**Memory ID: `game-engine`**
- Canvas-based 2D side-scroller with sprite engine
- CatSprite: jumping, ducking, invincibility frames
- Obstacles: furniture (boxes), vacuum cleaners, yarn balls
- Power-ups: catnip (invincibility), treats (double score)
- 22 tests covering collision detection, scoring, game states
- PWA-compatible (runs offline)

## Session 8: Fun Facts Slideshow

**Memory ID: `fun-facts`**
- 19 cat care/fact cards shown in carousel on dashboard
- Educational purpose: set realistic expectations before adoption
- Topics include: night activity, scratching, hairballs, vet costs, litter habits, social needs, shedding, 15-20yr commitment
- Designed to reduce adoption returns through education

## Session 9: Why No Chat Feature

**Memory ID: `no-chat-rationale`**
- Shelters are understaffed (often 1-2 people managing 50+ cats)
- Unanswered messages erode adopter trust
- AI Coach (Mr. Cat) fills the gap for non-urgent questions
- Smart Escalation handles emergencies with direct shelter contact
- Phone/email for urgent matters is more reliable than in-app messaging

## Session 10: Documentation

**Memory ID: `docs-structure`**
- README.md: project overview, features, architecture, judge walkthrough
- docs/architecture.md: system diagram, component tree, API routes
- docs/security.md: CSP, Firestore rules, vulnerability log
- docs/project-report.md: hackathon submission (12 sections)
- All docs link back to `https://forever-home-ai.vercel.app/`

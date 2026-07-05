# ForeverHome AI — Security Review

## Overview

This document serves as the security architecture review and manual security scan report for ForeverHome AI, covering the OWASP Top 10 for web applications as relevant to our stack.

---

## 1. Authentication & Authorization

### Firebase Authentication
- All authenticated endpoints use Firebase ID tokens verified against Google's JWKS
- Token verification implemented in `src/lib/verifyAuthToken.ts` using the `jose` library
- No Firebase Admin SDK dependency — avoids managing service account secrets

### Route Protection
- API routes verify the caller's Firebase ID token before returning or modifying data
- `/api/coach` verifies `adopterProfileId` matches the authenticated UID (prevents profile exfiltration)
- `/api/saved` verifies UID matches the authenticated user
- Guest mode is the only exception (no Firebase account required for demo)

### Firestore RBAC (`firestore.rules`)
```
- cats: read all, write shelter staff only
- users/{uid}: read/write own profile only
- assessments: read/write authenticated users
- aiLogs: create only (write-only for users, admin-only read via Cloud Functions)
```

---

## 2. API Key Protection

- **Gemini API keys are NEVER exposed to the browser**
- All AI calls happen server-side in Next.js API route handlers
- Keys are stored in server-side environment variables only
- Rate-limit caching prevents wasted requests on depleted quotas (HTTP 429)

---

## 3. Medical Safety Layer

A deterministic safety layer intercepts messages BEFORE any AI call:

- **26 emergency keywords** scanned (e.g., "not breathing", "seizure", "blood", "unconscious")
- Immediate deterministic response without calling AI
- Emergency contact buttons permanently visible in the coach interface
- Smart Escalation system for human behaviorist review

This is a defense-in-depth approach: even if the AI were to generate harmful advice, the deterministic layer catches emergencies first.

---

## 4. Data Privacy

### AI Logs (Firestore `aiLogs` collection)
- **Write-only** for authenticated users
- **No read access** for any user (only admins via Cloud Functions)
- Immutable — no updates or deletes allowed
- No full conversation context stored (only question + response + metadata)
- Auto-pruned in demo mode (last 100 entries in sessionStorage)

### User Data
- Adopter profiles are isolated by UID
- Assessment records auto-expire after 30 days
- No analytics or tracking beyond what's necessary for the feature

---

## 5. Input Validation

- All API routes validate required parameters before processing
- `adopterProfileId` validated for type, non-empty string before use
- Assessment quiz input is sanitized to expected enum values
- Scenario answers are constrained to a finite set of options

---

## 6. Dependency Security

- All npm dependencies locked in `package-lock.json`
- TypeScript strict mode enabled in `tsconfig.json`
- ESLint configured with Next.js recommended rules
- No deprecated or unmaintained dependencies

---

## 7. OWASP Top 10 Coverage

| # | Risk | Mitigation |
|---|---|---|
| A01 | Broken Access Control | Firebase ID token verification + Firestore RBAC + UID matching |
| A02 | Cryptographic Failures | HTTPS enforced (Vercel), Firebase tokens verified via JWKS |
| A03 | Injection | Server-side input validation, structured Firestore queries (no raw SQL) |
| A04 | Insecure Design | Threat model documented, defense-in-depth (medical escalation layer) |
| A05 | Security Misconfiguration | `.env.local` not committed, Firestore rules deployed, strict TypeScript |
| A06 | Vulnerable Components | Locked dependencies, no unmaintained packages |
| A07 | Auth Failures | Firebase Auth, ID token verification on every protected endpoint |
| A08 | Software/Data Integrity | JWKS for token verification, no unverified third-party scripts |
| A09 | Logging & Monitoring | `aiLogs` collection for AI interactions, console error logging |
| A10 | SSRF | No user-controlled URLs in server-side requests |

---

## 8. Recommendations for Production

1. **Add Firebase App Check** to prevent unauthorized client access to Firestore
2. **Implement rate limiting** on API routes (currently handled via Gemini key rotation)
3. **Add CSP headers** via `next.config.ts` for XSS protection
4. **Enable Firebase Security Rules tests** to validate rules in CI
5. **Add automated dependency scanning** (Dependabot or Snyk)
6. **Integrate Aikido security scanning** for CI/CD pipeline
7. **Add `helmet` or equivalent** security headers middleware

---

## 9. Security Contacts

For security issues, please review the [Firestore Security Rules](../firestore.rules) and [AI Logging Service](../src/lib/aiLoggingService.ts) documentation, or open an issue in the repository.

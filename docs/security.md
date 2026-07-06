# ForeverHome AI — Security Review

> **Deployment:** [forever-home-ai.vercel.app](https://forever-home-ai.vercel.app/) — Website + PWA

## Overview

This document serves as the security architecture review and Aikido security scan report for ForeverHome AI, covering the OWASP Top 10 for web applications as relevant to our stack.

**Last Security Scan: July 2026 (Aikido Security)**

---

## Security Scan Results — All Findings Resolved ✅

This project was scanned using [Aikido Security](https://www.aikido.dev/) automated security scanning. All findings have been remediated in code or documented with rationale:

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | serialize-javascript CVE | High | ✅ Remediated — override `^7.0.7` |
| 2 | fast-uri CVE-2026-13676 | High | ✅ Remediated — override `^3.1.2` |
| 3 | IDOR — firestore.rules (assessments) | High | ✅ Remediated — `is string` + `size()` guards |
| 4 | IDOR — firestore.rules (shelters/cats) | High | ✅ Remediated — `exists()` + `adminUid` validation |
| 5 | XSS — login redirect (open redirect) | Medium | ✅ Remediated — validated to relative paths only |
| 6 | rollup XSS vector | Medium | ✅ Remediated — override `^2.79.2` |
| 7 | Improper Access Control (firestore.rules) | Medium | ✅ Remediated — field type/size bounds on all collections |
| 8 | Python file inclusion (core.py) | Medium | ✅ Remediated — path traversal guard via `Path.resolve()` |
| 9 | GitHub org IP allow list | Medium | 📋 Organization setting (github.com org admin) |

### Remediation Details

#### 1. serialize-javascript (High) — FIXED ✓
- **CVEs**: GHSA-5c6j-r48x-rmvq, AIKIDO-2025-10874
- **Fix**: Override `"serialize-javascript": "^7.0.7"` in `package.json`
- Prevents attacker-controlled code injection during serialization

#### 2. fast-uri CVE-2026-13676 (High) — FIXED ✓
- **Issue**: Host canonicalization for Unicode/IDN values could allow security bypasses
- **Fix**: Override `"fast-uri": "^3.1.2"` in `package.json`
- Prevents interpretation conflicts between services

#### 3. IDOR — Assessments (High) — FIXED ✓
- **Issue**: `resource.data.adopterUid == request.auth.uid` could bypass when `adopterUid` is null (null comparison matches null)
- **Fix**: Added `resource.data.adopterUid is string && resource.data.adopterUid.size() <= 128` before comparison
- Prevents null-byte and type-confusion bypass attacks on assessment reads

#### 4. IDOR — Shelters/Cats (High) — FIXED ✓
- **Issue**: Original rules allowed any shelter admin to modify cross-shelter cats
- **Fix**: Triple validation: (1) shelter `exists()`, (2) `adminUid` matches, (3) `cat.shelterId` matches
- Prevents cross-shelter data tampering

#### 5. XSS — Login Open Redirect (Medium) — FIXED ✓
- **Issue**: `searchParams.get("redirect")` could accept `javascript:` or `//evil.com` URLs
- **Fix**: Validates `rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")`
- Only allows relative same-origin paths

#### 6. rollup (Medium) — FIXED ✓
- **Issue**: Older rollup versions vulnerable to XSS via plugin output
- **Fix**: Override `"rollup": "^2.79.2"` in `package.json`

#### 7. Improper Access Control — Firestore (Medium) — FIXED ✓
- **Issue**: Escalation reports and adoption requests had no string size validation
- **Fix**: Added `size() <= 128/256` bounds on all string fields (shelterId, catId, catName, adopterName, adopterEmail)
- Mitigates spam/injection via oversized payloads

#### 8. Python Path Traversal (Medium) — FIXED ✓
- **Issue**: `_load_csv()` in `core.py` opened files without path validation
- **Fix**: Resolves path → verifies it stays within `DATA_DIR` using `Path.parents`
- Raises `ValueError` on escape attempt

---

## 1. Authentication & Authorization

### Firebase Authentication
- All authenticated endpoints use Firebase ID tokens verified against Google's JWKS
- Token verification implemented in `src/lib/verifyAuthToken.ts` using the `jose` library
- No Firebase Admin SDK dependency — avoids managing service account secrets
- JWKS cached via `createRemoteJWKSet` for performance

### Route Protection
- API routes verify the caller's Firebase ID token before returning or modifying data
- `/api/coach` verifies `adopterProfileId` matches the authenticated UID (prevents profile exfiltration)
- `/api/saved` verifies UID matches the authenticated user
- Guest mode is the only exception (no Firebase account required for demo)

### Firestore RBAC (`firestore.rules`)

10 collections with granular access control:

| Collection | Read | Write | Notes |
|-----------|------|-------|-------|
| `cats` | Public | Shelter admin only | Triple validation (exists + adminUid + shelterId) |
| `users/{uid}` | Self only | Self only | UID must match |
| `users/{uid}/adopterProfile` | Self only | Self only | Subcollection isolation |
| `users/{uid}/meta` | Self only | Self only | Wishlist data |
| `assessments` | Self (adopterUid) | Self (adopterUid) | `is string` guard, immutable |
| `aiLogs` | None (admin only) | Authenticated | Write-only, immutable |
| `shelters` | Public | Admin only | `is string` + `size()` guards |
| `escalationReports` | Shelter owner | Field-validated | `size()` bounds, immutable |
| `adoptionRequests` | Shelter owner | Field-validated | `size()` bounds, status updates |
| `shelterReviews` | Public | Author only | UID matching |
| `*` (default) | Deny | Deny | Principle of least privilege |

---

## 2. API Key Protection

- **Gemini API keys are NEVER exposed to the browser**
- All AI calls happen server-side in Next.js API route handlers
- Keys are stored in server-side environment variables only (`GEMINI_API_KEY`)
- Rate-limit caching prevents wasted requests on depleted quotas (HTTP 429 → 90s cooldown)
- Model failover chain: gemini-3.5-flash → gemini-3-flash-preview → gemini-2.5-flash (with lite variants)

---

## 3. Medical Safety Layer (Defense-in-Depth)

A deterministic safety layer intercepts ALL messages before ANY AI call:

- **26 emergency keywords** scanned (e.g., "not breathing", "seizure", "blood", "unconscious", "collapse", "poisoned")
- Case-insensitive matching
- Immediate deterministic response without calling AI
- Emergency contact buttons permanently visible in the coach interface
- Smart Escalation system for human behaviorist review

This ensures that even if the AI generates harmful advice, the deterministic layer catches emergencies first.

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
- Firebase Authentication managed by Google infrastructure

---

## 5. Input Validation

- All API routes validate required parameters before processing
- `adopterProfileId` validated for type, non-empty string before use
- Assessment quiz input is sanitized to expected enum values
- Scenario answers are constrained to a finite set of options
- Firestore rules enforce field type + size validation
- Login redirect URL validated to prevent open redirect / XSS
- Python CSV loader validates paths stay within data directory

---

## 6. Dependency Security

- All npm dependencies locked in `package-lock.json`
- 3 security overrides applied in `package.json`:
  - `serialize-javascript`: `^7.0.7`
  - `fast-uri`: `^3.1.2`
  - `rollup`: `^2.79.2`
- TypeScript strict mode enabled in `tsconfig.json`
- ESLint configured with Next.js recommended rules
- Known vulnerabilities tracked via Aikido Security (continuous scanning)
- Vercel deployment enforces HTTPS by default

---

## 7. OWASP Top 10 Coverage

| # | Risk | Mitigation |
|---|------|-----------|
| A01 | Broken Access Control | Firebase ID token verification + Firestore RBAC + UID matching + `is string` guards + shelter existence validation + `size()` bounds |
| A02 | Cryptographic Failures | HTTPS enforced (Vercel), Firebase tokens verified via JWKS, no custom crypto |
| A03 | Injection | Server-side input validation, structured Firestore queries (no raw SQL), XSS open redirect fixed, field type/size validation |
| A04 | Insecure Design | Threat model documented, defense-in-depth (medical escalation layer), least privilege default-deny Firestore rules |
| A05 | Security Misconfiguration | `.env.local` not committed, Firestore rules deployed, strict TypeScript, no debug endpoints in production |
| A06 | Vulnerable Components | Locked dependencies, Aikido scanning enabled, 3 CVE overrides applied, all findings remediated |
| A07 | Auth Failures | Firebase Auth, ID token verification on every protected endpoint, JWKS validation |
| A08 | Software/Data Integrity | JWKS for token verification, no unverified third-party scripts, npm integrity hashes |
| A09 | Logging & Monitoring | `aiLogs` collection for AI interactions, console error logging, Aikido continuous monitoring |
| A10 | SSRF | No user-controlled URLs in server-side requests, Gemini API calls use hardcoded endpoints |

---

## 8. Recommendations for Production

1. ✅ **Aikido security scanning** — integrated, all findings remediated
2. **Add Firebase App Check** to prevent unauthorized client access to Firestore
3. **Implement rate limiting** on API routes (currently handled via Gemini key rotation)
4. **Add CSP headers** via `next.config.ts` for defense-in-depth XSS protection
5. **Enable Firebase Security Rules tests** to validate rules in CI
6. **Add automated dependency scanning** (Dependabot or Snyk)
7. ✅ **Upgrade serialize-javascript** to `^7.0.7`
8. ✅ **Upgrade fast-uri** to `^3.1.2`
9. **Add `helmet` or equivalent** security headers middleware
10. **Migrate escalation/adoption APIs to Firebase Admin SDK** for full auth context in Firestore writes

---

## 9. Security Contacts

For security issues, please review the [Firestore Security Rules](../firestore.rules) and [AI Logging Service](../src/lib/aiLoggingService.ts) documentation, or open an issue in the repository.

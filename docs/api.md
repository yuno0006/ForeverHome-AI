# ForeverHome AI — API Reference

## Base URL

- Development: `http://localhost:3000/api`
- Production: `https://[your-vercel-domain]/api`

All API routes are Next.js Route Handlers under `src/app/api/`.

---

## Authentication

Protected endpoints require a Firebase ID token sent as a Bearer token:
```
Authorization: Bearer <firebase-id-token>
```

Token verification is handled by `src/lib/verifyAuthToken.ts` using `jose` against Google's JWKS.

---

## Endpoints

### POST `/api/coach`

Generate an AI coach response for post-adoption support.

**Request Body:**
```json
{
  "message": "My cat has been hiding for 3 days",
  "catName": "Barnaby",
  "catProfile": "low energy, high stress sensitivity...",
  "currentDay": 3,
  "checkIns": [{ "day": 1, "eating": true, "drinking": true, ... }],
  "adopterProfileId": "user-uid-here"
}
```

**Response (200):**
```json
{
  "response": "It's completely normal for Barnaby to still be hiding...",
  "source": "gemini",
  "disclaimer": null
}
```

**Response (Medical Emergency):**
```json
{
  "response": "THIS MAY BE A MEDICAL EMERGENCY\n\n...",
  "isEmergency": true,
  "source": "deterministic"
}
```

**Error (401):**
```json
{ "error": "Unauthorized" }
```

**Security:**
- `adopterProfileId` is verified against the authenticated user's UID
- Medical keywords are checked deterministically before any AI call
- All interactions logged to `aiLogs` collection (fire-and-forget)

---

### POST `/api/counselor`

Generate an AI explanation for compatibility assessment results. Uses **sequential model fallback** — models are tried one-by-one, the first to return valid JSON wins. If all AI models fail, a deterministic rule-based fallback is returned.

**Request Body:**
```json
{
  "compatibilityResult": {
    "level": "high_risk",
    "concerns": [{ "ruleId": "stress-noise", "description": "..." }],
    "strengths": [{ "ruleId": "experience-match", "description": "..." }]
  },
  "cat": { "id": "barnaby", "name": "Barnaby", "behavior": { "energy": "low", ... } },
  "adopter": { "id": "user-uid", "homeType": "apartment", ... },
  "scenarioQA": [{ "questionIndex": 0, "selectedScore": 1, ... }]
}
```

**Response (200 — AI success):**
```json
{
  "source": "gemini",
  "aiResult": {
    "riskLevel": "high_risk",
    "concerns": ["Barnaby's low stress tolerance conflicts with...", "..."],
    "strengths": ["Your experience with cats...", "..."],
    "protectiveFactors": ["You work from home", "You have no children"],
    "explanation": "Based on the assessment, Barnaby's low stress tolerance..."
  }
}
```

**Response (200 — AI fallback):**
```json
{
  "explanation": "This explanation was generated without AI...",
  "source": "fallback",
  "disclaimer": "This explanation was generated without AI."
}
```

**Fallback detection**: The client checks if `aiResult` exists in the response. If yes, the AI result **replaces** the rule-based compatibility result as the single source of truth. If no `aiResult`, the rule-based engine result is kept and the fallback explanation is shown.

---

### POST `/api/escalation`

Create a Smart Escalation ticket for human shelter review.

**Request Body:**
```json
{
  "catName": "Barnaby",
  "shelterId": "paws-haven",
  "priority": "urgent" | "behavioral",
  "summary": "Cat not eating for 2 days...",
  "checkIns": [...],
  "chatHistory": [...],
  "adopterName": "Jane"
}
```

**Response (200):**
```json
{
  "success": true,
  "ticketId": "escalation-ticket-id"
}
```

---

### POST `/api/saved`

Manage the user's wishlist (saved cats).

**Request Body:**
```json
{
  "uid": "user-uid",
  "action": "add" | "remove",
  "catId": "barnaby"
}
```

**Response (200):**
```json
{
  "catIds": ["barnaby", "luna"]
}
```

**Security:** UID is verified against the authenticated user's token.

---

## Error Codes

| Status | Meaning |
|---|---|
| 200 | Success |
| 400 | Bad request / invalid parameters |
| 401 | Unauthorized / invalid token |
| 500 | Server error / AI unavailable |

---

## AI Logging (`aiLogs` Collection)

| Property | Description |
|---|---|
| `uid` | User ID who made the request |
| `catId` | Cat being discussed |
| `question` | User's message / query context |
| `response` | AI's response |
| `source` | `"gemini"` or `"fallback"` |
| `timestamp` | Server timestamp |

**Privacy policy**: No full conversation context is stored. Logs are write-only for users (read access restricted to admins via Cloud Functions).

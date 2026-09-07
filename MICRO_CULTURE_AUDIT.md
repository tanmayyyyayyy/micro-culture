# MICRO CULTURE — Complete Project Audit

> Generated: 2026-09-07 | Status: Pre-MVP scaffold, partially functional end-to-end

---

## 1. Architecture

```
microculture/
├── backend/              Node.js (ESM) + Express + Mongoose
│   ├── server.js         Entry point, CORS, route mounting, error handler
│   ├── config/db.js      MongoDB connection (Atlas)
│   ├── middleware/auth.js JWT Bearer token verification
│   ├── models/           5 Mongoose models (User, Culture, Ritual, DailyRitual, RitualLog)
│   ├── routes/           4 route files (auth, cultures, ai, logs)
│   └── .env              REAL SECRETS PRESENT (see §9)
│
└── frontend/             React 18 + Vite + Tailwind CSS + React Router v6
    └── src/
        ├── App.jsx        Route definitions (10 pages)
        ├── api/client.js  Axios instance with JWT interceptor
        ├── context/       AuthContext (login, register, logout)
        ├── components/    NavBar, ProtectedRoute
        └── pages/         10 pages (see §6)
```

**Technology stack (actual):**
- Frontend: React 18, Vite 5, Tailwind 3, React Router 6, Axios 1.7
- Backend: Node.js ESM, Express 4, Mongoose 8, bcryptjs, jsonwebtoken, openai SDK 4.56
- Database: MongoDB Atlas (live cluster — VERIFIED CONNECTED)
- AI: Groq API via OpenAI-compatible SDK (`openai/gpt-oss-120b` model — VERIFIED WORKING)
- Media: Not implemented (Cloudinary planned, placeholder only)
- Tests: None

---

## 2. Current Features

| Feature | Status | Notes |
|---|---|---|
| User Registration | FULL end-to-end | bcrypt hash, JWT issued |
| User Login | FULL end-to-end | JWT stored in localStorage |
| Logout | Works | Clears localStorage |
| Protected Routes | Works | ProtectedRoute redirects to /login |
| Explore Cultures | Wired to real API | Fetches isPublished:true cultures |
| Culture Detail | Wired to real API | Shows values, aesthetic, jargon |
| Join Culture | Wired | Updates DB on both sides |
| Leave Culture | Backend only | NO UI button on detail page |
| Create Culture (seed form) | Wired to AI | Calls /ai/generate-culture |
| Create Culture (review/edit) | Wired | Editable blueprint before publish |
| Create Culture (publish) | Wired | Posts to /cultures, seeds Rituals |
| Dashboard | Wired | Loads joined cultures from user context |
| Daily Ritual (generate) | Wired + idempotent | Calls /ai/generate-ritual, persists to DB |
| Daily Ritual (log/post) | Wired | Posts to /logs |
| Culture Feed | Wired | Fetches real RitualLogs |
| Weekly Summary | Backend only | /ai/weekly-summary route exists, NO UI |
| Profile | Mock/minimal | Shows user data from localStorage only |
| Image uploads | MISSING | Comment in code says TODO Cloudinary |
| Culture evolution / ritual suggestion | MISSING | Out of scope for MVP per CLAUDE.md |
| Password validation (min length) | MISSING | No server-side length check |
| Input sanitization | MISSING | No express-validator or equivalent |
| Rate limiting | MISSING | AI routes are unprotected from abuse |

---

## 3. Working APIs

All routes prefixed from `http://localhost:5001`.

### Auth (`/auth`)

| Method | Path | Auth Required | Description |
|---|---|---|---|
| POST | /auth/register | No | Register user, returns JWT + user |
| POST | /auth/login | No | Login, returns JWT + user |

### Cultures (`/cultures`)

| Method | Path | Auth Required | Description |
|---|---|---|---|
| POST | /cultures | YES | Create culture (with blueprint) |
| GET | /cultures | No | List all published cultures, supports ?q= search |
| GET | /cultures/:id | No | Get culture + activeRituals |
| POST | /cultures/:id/join | YES | Join culture |
| POST | /cultures/:id/leave | YES | Leave culture |

### AI (`/ai`)

| Method | Path | Auth Required | Description |
|---|---|---|---|
| POST | /ai/generate-culture | YES | Generate culture blueprint from seed |
| POST | /ai/generate-ritual | YES | Generate/fetch today's ritual (idempotent) |
| POST | /ai/weekly-summary | YES | AI summary of weekly ritual logs |

### Logs (`/logs`)

| Method | Path | Auth Required | Description |
|---|---|---|---|
| POST | /logs | YES | Post a ritual log |
| GET | /logs/:cultureId | No | Get all logs for a culture |

**Missing routes:**
- `GET /auth/me` — no way to refresh user data from server
- `PUT /cultures/:id` — no culture edit route
- `DELETE /cultures/:id` — no delete route
- `GET /cultures/:id/rituals` — no explicit ritual list route
- `GET /ai/daily-ritual/:cultureId` — GET version for idempotent fetch would be cleaner

---

## 4. Database Schema

### `users`
```js
{
  name: String (required, trimmed),
  email: String (required, unique, lowercase),
  passwordHash: String (required),      // bcrypt, never plaintext
  joinedCultures: [ObjectId -> Culture],
  createdCultures: [ObjectId -> Culture],
  timestamps: true
}
// Methods: comparePassword(plain), toSafeJSON()
```

### `cultures`
```js
{
  name: String (required),
  description: String (required),
  vibeWords: [String],
  aesthetic: [String],
  values: [String],
  jargon: [String],
  rituals: [String],        // starter ritual TEXT strings (snapshot)
  symbol: String,           // emoji
  imageUrl: String,
  color: String,
  creatorId: ObjectId -> User (required),
  members: [ObjectId -> User],
  isPublished: Boolean (default: false),
  timestamps: true
}
// Virtual: membersCount (computed from members.length)
```

### `rituals`
```js
{
  cultureId: ObjectId -> Culture (required),
  text: String (required),
  isAIgenerated: Boolean,
  status: enum['active', 'retired', 'suggested'] (default: 'active'),
  timestamps: true
}
// These are the culture's persistent ritual DEFINITIONS, seeded at creation
```

### `dailyrituals`
```js
{
  cultureId: ObjectId -> Culture (required),
  ritualText: String (required),
  date: String (required),  // YYYY-MM-DD
  timestamps: true
}
// Unique index: {cultureId, date} -- this is the idempotency store
```

### `rituallogs`
```js
{
  userId: ObjectId -> User (required),
  cultureId: ObjectId -> Culture (required),
  ritualId: ObjectId -> Ritual (OPTIONAL),  // BUG: never sent by frontend
  content: String (required),
  imageUrl: String,
  timestamps: true
}
```

**NOTE:** `ritualId` is optional and the frontend never sends it — logs are not linked to the specific daily ritual that was completed.

---

## 5. AI Architecture

**Provider:** Groq API (using OpenAI-compatible SDK)
**Model:** `openai/gpt-oss-120b`
**Connectivity:** CONFIRMED WORKING (tested live during audit)
**MongoDB:** CONFIRMED WORKING (2 users, 2 cultures in Atlas)

### AI Feature 1: Culture Blueprint Generator (`/ai/generate-culture`)
- Input: `{ name, description, vibeWords[] }`
- Output: `{ aesthetic[], values[], jargon[], rituals[], symbol }`
- Status: Fully implemented, defensive JSON parsing, array validation
- Gap: No server-side token/cost limits, no output length validation

### AI Feature 2: Daily Ritual Generator (`/ai/generate-ritual`)
- Input: `{ cultureId }`
- How it works: Checks DailyRitual for today's date first (idempotent). If none, calls Groq with culture identity + last 7 rituals as context, then persists to DB.
- Status: Fully implemented and idempotent. Ritual IS persisted — NOT regenerated on every page load.
- Gap: No membership check — any logged-in user can generate a ritual for any culture they are not a member of.

### AI Feature 3: Weekly Summary (`/ai/weekly-summary`)
- Input: `{ cultureId }`
- Output: `{ summary, ritualOfTheWeek: { content, reason } }`
- Status: Backend complete, NO frontend UI to trigger or display it

### Defensive JSON Parsing (`parseJSONResponse`)
- Strips ```json and ``` fences
- Falls back to brace-extraction if JSON.parse fails
- Wraps in try/catch with descriptive error
- Status: Well implemented

### AI Memory / Culture Context
- Ritual generator uses: culture name, values, jargon, aesthetic + last 7 daily rituals
- GAP: RitualLogs (member participation) are NOT fed back into AI ritual generation — the culture "memory" loop is incomplete

---

## 6. Frontend Routes

| Route | Component | Auth | Backend Connected | Status |
|---|---|---|---|---|
| / | Landing | No | No | Static marketing page |
| /explore | Explore | No | /cultures | Live data, search works |
| /cultures/:id | CultureDetail | No | /cultures/:id | Live data |
| /login | Login | No | /auth/login | Full flow |
| /signup | Signup | No | /auth/register | Full flow |
| /create | CreateCulture | YES | /ai/generate-culture + /cultures | Full AI flow |
| /dashboard | Dashboard | YES | /cultures/:id (per joined) | Works but N+1 queries |
| /cultures/:id/ritual | DailyRitualPage | YES | /ai/generate-ritual + /logs | Full flow |
| /cultures/:id/feed | CultureFeed | YES | /logs/:cultureId | Live data |
| /profile | Profile | YES | NONE | Shows stale localStorage data only |

---

## 7. Missing Functionality

### P0 — Critical for Working MVP

- **`GET /auth/me` endpoint** — Profile and Dashboard rely on localStorage user data that becomes stale after join/leave/create. A /auth/me endpoint would re-hydrate the user context on load.
- **Membership check on AI routes** — Anyone authenticated can call `/ai/generate-ritual` for any culture, even ones they didn't join.
- **`ritualId` linkage in logs** — When a user posts a log from DailyRitualPage, the ritualId of the current DailyRitual is NOT sent. Culture memory and weekly summary lose traceability.
- **Leave culture UI** — The leave route exists in the backend but there is no UI button in CultureDetail.
- **Error handling in CultureDetail/CultureFeed** — No try/catch; on 404 or network error, components silently hang on "Loading..." forever.
- **GET endpoint for daily ritual** — Frontend calls `POST /ai/generate-ritual` on every page load; a GET endpoint would be semantically cleaner.

### P1 — Important for Polished Product

- **Profile page** — Completely static, shows only localStorage data. Needs live fetch.
- **Weekly summary UI** — Backend fully implemented, no frontend anywhere.
- **Culture edit** — No `PUT /cultures/:id` route, creator cannot edit a published culture.
- **Culture delete** — No `DELETE /cultures/:id` route.
- **Pagination** — Culture list and feed both load all documents at once.
- **Image uploads** — Cloudinary or local disk, not implemented.
- **Timestamp display in feed** — CultureFeed shows name and content but no date/time.
- **Dashboard N+1** — Dashboard fetches each culture in a separate request; needs batch endpoint.

### P2 — Future Enhancements

- Culture evolution (AI suggests new/retired rituals, creator approves)
- RitualLog -> AI memory loop (feed member logs into ritual generation)
- Cron-based daily ritual pre-generation
- Culture history/activity timeline
- Notification system
- Culture analytics
- Social reactions (like/react to logs)
- Image upload (Cloudinary)

---

## 8. Bugs

| # | Severity | Location | Description |
|---|---|---|---|
| B1 | High | Dashboard.jsx | N+1 query: fetches each culture individually via Promise.allSettled. Should use a batch endpoint. |
| B2 | High | Dashboard.jsx / AuthContext.jsx | User's joinedCultures in localStorage becomes stale after join/leave/create. Context never refreshed from server. |
| B3 | Medium | CultureDetail.jsx | No try/catch around api.get() — on 404, component silently hangs on "Loading..." forever. |
| B4 | Medium | CultureFeed.jsx | No try/catch — if API fails, component hangs on "Loading..." forever. |
| B5 | Medium | DailyRitualPage.jsx | Calls POST /ai/generate-ritual on every mount. While idempotent via DB check, POST is semantically wrong for a "fetch today's ritual" operation. React StrictMode double-invoke could race. |
| B6 | Low | DailyRitualPage.jsx | Log posted to /logs does NOT include ritualId, breaking linkage between a log and the daily ritual it was a response to. |
| B7 | Low | backend/routes/cultures.js | GET /cultures/:id returns activeRituals from Ritual collection, but CultureDetail never displays them — data is fetched and discarded. |
| B8 | Low | backend/routes/logs.js | GET /logs/:cultureId has no auth — anyone including unauthenticated users can read all ritual logs. May be intentional but should be a deliberate decision. |
| B9 | Low | AuthContext.jsx | User data read from localStorage on mount without validation — corrupted localStorage can break the app with no clear error. |
| B10 | Low | backend/ | Empty directory named literally "{models,routes,middleware,config}" — artifact of a misrun shell brace-expansion command. Harmless but should be removed. |

---

## 9. Security Issues

### SEC-1 — CRITICAL: Live secrets in .env

**File:** `backend/.env`

Exposed credentials:
- MongoDB Atlas connection string with plaintext password
- Live Groq API key
- JWT secret

**Risk:** If project is pushed to GitHub or shared, these secrets are immediately compromised.
**Current status:** .gitignore in both directories contains `.env` and the repo has no .git yet — so they are not currently committed. But this must be verified before `git init`.

### SEC-2 — HIGH: No rate limiting on AI endpoints

`/ai/generate-culture`, `/ai/generate-ritual`, `/ai/weekly-summary` are only protected by JWT auth. Any authenticated user can call these in a tight loop, draining Groq API credits.

**Fix:** Add `express-rate-limit` per-user per-endpoint.

### SEC-3 — HIGH: No membership check on AI ritual generation

`POST /ai/generate-ritual` accepts any cultureId from any authenticated user, even if they are not a member of that culture.

**Fix:** Check `culture.members.includes(req.userId)` before calling AI.

### SEC-4 — MEDIUM: No input validation/sanitization

Route handlers access req.body fields directly with no length limits, type checks, or sanitization. Long strings could inflate AI prompts and increase cost.

**Fix:** Add validation middleware with length limits on AI-fed fields.

### SEC-5 — MEDIUM: Unvalidated AI output returned to client

AI response is parsed and returned to frontend without schema validation. A misbehaving model could return unexpected structure.

**Fix:** Validate shape (types, array lengths, string lengths) before responding.

### SEC-6 — MEDIUM: No password minimum length

`/auth/register` accepts passwords of any length including 1 character. No server-side minimum enforced.

**Fix:** `if (password.length < 8) return 400`.

### SEC-7 — LOW: JWT in localStorage (XSS risk)

JWT stored in localStorage is accessible to any JS on the page. Acceptable for MVP but httpOnly cookies are more secure.

### SEC-8 — LOW: CORS wildcard fallback

`cors({ origin: process.env.CLIENT_URL || "*" })` — if CLIENT_URL is unset, all origins are allowed.

**Fix:** Remove `|| "*"` fallback.

### SEC-9 — LOW: Unauthenticated feed read

`GET /logs/:cultureId` is public — all member names and ritual log content are readable without login.

---

## 10. Recommended Architecture

### Backend additions needed

```
GET  /auth/me                  re-hydrate user from DB
GET  /ai/daily-ritual/:id      idempotent GET for today's ritual
PUT  /cultures/:id             edit culture (creator only)
DELETE /cultures/:id           delete culture (creator only)
GET  /cultures?ids=a,b,c       batch culture fetch for Dashboard
GET  /cultures/:id/summary     trigger + cache weekly AI summary
middleware/rateLimit.js        express-rate-limit per user
middleware/validate.js         input validation middleware
```

### Frontend additions needed

```
context/AuthContext.jsx        add refreshUser() from /auth/me
pages/Profile.jsx              rebuild with live server data
pages/CultureDetail.jsx        add Leave button, display activeRituals
pages/CultureFeed.jsx          add timestamp, pagination
pages/DailyRitualPage.jsx      send ritualId with log post; use GET endpoint
pages/WeeklySummary.jsx        new page for AI weekly summary
```

### Culture memory loop (AI Ritual Engine — full intended flow)

```
Member completes ritual
  -> Posts RitualLog (linked to DailyRitual via ritualId)  [currently broken - ritualId not sent]
    -> RitualLogs accumulate over days/weeks
      -> Next day's ritual generation reads last 7 DailyRituals  [this part works]
        -> Weekly summary reads last 7 days of RitualLogs  [this part works, no UI]
          -> [Future] Ritual generation also reads recent logs for richer context  [P2]
```

---

## 11. Prioritized Implementation Roadmap

### P0 — Required for Working MVP

| ID | Task | Files Affected |
|---|---|---|
| P0-1 | Add GET /auth/me endpoint; call in AuthContext on mount | backend/routes/auth.js, frontend/src/context/AuthContext.jsx |
| P0-2 | Fix ritualId linkage: send ritual._id when posting log | frontend/src/pages/DailyRitualPage.jsx |
| P0-3 | Add membership check to /ai/generate-ritual | backend/routes/ai.js |
| P0-4 | Add try/catch + error UI to CultureDetail and CultureFeed | frontend/src/pages/CultureDetail.jsx, CultureFeed.jsx |
| P0-5 | Add Leave culture button to CultureDetail | frontend/src/pages/CultureDetail.jsx |
| P0-6 | Add rate limiting to AI routes | New backend/middleware/rateLimit.js, backend/routes/ai.js |
| P0-7 | Add password minimum length on register | backend/routes/auth.js |
| P0-8 | Delete the empty {models,routes,middleware,config} artifact directory | backend/ |
| P0-9 | Add batch culture fetch endpoint; fix Dashboard N+1 | backend/routes/cultures.js, frontend/src/pages/Dashboard.jsx |
| P0-10 | Add GET /ai/daily-ritual/:cultureId; switch frontend to use it | backend/routes/ai.js, frontend/src/pages/DailyRitualPage.jsx |

### P1 — Important for Polished Product

| ID | Task | Files Affected |
|---|---|---|
| P1-1 | Rebuild Profile.jsx with live server data | frontend/src/pages/Profile.jsx, backend/routes/auth.js |
| P1-2 | Add Weekly Summary UI to CultureFeed or new page | New frontend/src/pages/WeeklySummary.jsx |
| P1-3 | Add timestamps + author info to CultureFeed | frontend/src/pages/CultureFeed.jsx |
| P1-4 | Add PUT /cultures/:id + culture edit UI | backend/routes/cultures.js, frontend/src/pages/CultureDetail.jsx |
| P1-5 | Add input validation middleware | New backend/middleware/validate.js |
| P1-6 | Add AI output schema validation | backend/routes/ai.js |
| P1-7 | Add pagination to culture list and feed | backend/routes/cultures.js, backend/routes/logs.js |
| P1-8 | Remove CORS wildcard fallback | backend/server.js |
| P1-9 | Improve UI design — current is minimal utility classes only, no design system | All page components |

### P2 — Future Enhancements

| ID | Task | Description |
|---|---|---|
| P2-1 | Cloudinary image uploads | Allow ritual logs to include photos |
| P2-2 | AI memory loop | Feed recent RitualLogs into ritual generation prompt |
| P2-3 | Culture evolution system | AI suggests new/retired rituals; creator approves |
| P2-4 | Cron-based ritual pre-generation | Pre-generate rituals for all cultures at midnight |
| P2-5 | Culture activity timeline | Full history view of logs + ritual changes |
| P2-6 | Notification system | Daily ritual reminders |
| P2-7 | Social reactions | Like/react to ritual logs |
| P2-8 | Culture analytics dashboard | Participation, active members, ritual history |
| P2-9 | httpOnly cookie auth | Replace localStorage JWT with secure cookies |

---

## Appendix: Live Connectivity Verification (2026-09-07)

```
PASS  MongoDB Atlas: CONNECTED (2 users, 2 cultures in DB)
PASS  Groq API (openai/gpt-oss-120b): WORKING, returned valid JSON
PASS  Backend node_modules: installed and present
PASS  Frontend node_modules: installed and present
PASS  JWT auth middleware: Correctly implemented
PASS  bcrypt password hashing: Correctly implemented
PASS  Daily ritual idempotency: Correctly implemented (unique index on cultureId+date)
PASS  Defensive JSON parsing: Correctly implemented
WARN  Real credentials in .env: Not in git yet, but must verify .gitignore before git init
FAIL  Tests: None exist anywhere in the project
```

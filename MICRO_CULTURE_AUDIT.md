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

---

## P0 Implementation Status

> Completed: 2026-09-09

### SEC-1 — Secrets

**DONE**

- Confirmed no secrets are hardcoded in any source file — all references use `process.env.*`
- Both `backend/.env` and `frontend/.env` are listed in their respective `.gitignore` files
- No git repository exists yet; secrets have never been committed
- `backend/.env.example` updated to match actual env vars used (Groq keys, correct port, CLIENT_URL)
- **ACTION REQUIRED:** Before running `git init`, verify `.gitignore` is working with `git check-ignore -v backend/.env`. If you ever rotate the Groq key or MongoDB password, update `.env` only — not `.env.example`

### SEC-2 — AI Rate Limiting

**DONE**

- Created `backend/middleware/rateLimit.js` using `express-rate-limit`
- Three limiters:
  - `aiLimiter`: 30 calls/hour per user (applied to all AI routes)
  - `cultureGenerateLimiter`: 10 calls/hour per user (applied to blueprint generation)
  - `authLimiter`: 20 attempts/15 min per IP (applied to login + register)
- Keys by authenticated `userId` when available, falling back to IP (IPv6-safe via `ipKeyGenerator`)
- Returns HTTP 429 with JSON `{ error: "...", retryAfterSeconds: N }` on limit exceeded
- `validate: { xForwardedForHeader: false }` prevents false IPv6 warnings in dev

### SEC-3 — Culture Membership Authorization

**DONE**

- `GET /ai/daily-ritual/:cultureId` — checks `culture.members.includes(req.userId)` before generating
- `POST /ai/generate-ritual` — same membership check (backward compat route kept)
- `POST /ai/weekly-summary` — added membership check (was missing)
- `POST /logs` — added membership check before allowing log post
- All return HTTP 403 with clear error message for non-members
- Authorization is enforced server-side; frontend checks are UI-only

### B6 — ritualId Missing From Ritual Logs

**DONE**

- `DailyRitualPage.jsx` now calls `GET /ai/daily-ritual/:id` (semantic GET, not POST)
- Ritual `_id` is available from the response before the log form is shown
- Log submission sends `{ cultureId, ritualId: ritual._id, content }` to `POST /logs`
- Backend validates `ritualId` exists and belongs to the given culture before accepting the log
- `RitualLog.ritualId` ref changed from `"Ritual"` to `"DailyRitual"` (correct semantics)
- `GET /logs/:cultureId` now populates `ritualId` with `title` and `date` from DailyRitual
- `CultureFeed.jsx` displays the ritual title on each log card

### B2 — Stale joinedCultures in localStorage

**DONE**

- Added `GET /auth/me` endpoint that returns fresh user data from MongoDB
- `AuthContext.jsx` now has `refreshUser()` function that calls `/auth/me` and updates state + localStorage
- `refreshUser()` is called:
  - On app mount (after restoring localStorage snapshot for immediate render)
  - After `login()` and `register()`
  - After `handleJoin()` in `CultureDetail.jsx`
  - After `handleLeave()` in `CultureDetail.jsx`
  - After `handlePublish()` in `CreateCulture.jsx`
- Dashboard always shows the correct cultures after any membership change
- DB is the source of truth; localStorage is only a fast-load cache

### B1 — Dashboard N+1 API Calls

**DONE**

- Added `GET /cultures/dashboard` endpoint in `backend/routes/cultures.js`
- Single endpoint fetches fresh user data from DB, then all joined cultures in one MongoDB query
- Returns `{ cultures: [...], stats: { totalJoined, totalCreated } }`
- `Dashboard.jsx` replaced N individual culture fetches with one call to `/cultures/dashboard`
- Route is registered before `/:id` to avoid Express param collision

### AI Memory Loop

**DONE**

Full culture memory context is now built and sent to AI for each ritual generation:

1. **Culture identity** — name, description, values, aesthetic, jargon (from Culture model)
2. **Recent daily rituals** — last 7 days of AI-generated rituals (avoid repetition)
3. **Member participation** — last 20 ritual logs with member names and content
4. **Structured output** — AI now returns `{ title, description, instructions[], durationMinutes, difficulty, reflectionPrompt, reason }` instead of a single `ritualText` string
5. **Output validation** — `validateStructuredRitual()` validates every field before saving
6. **Race condition safety** — `findOneAndUpdate` with `$setOnInsert` + `upsert: true` prevents duplicate rituals from concurrent requests
7. **Backward compatibility** — `ritualText` field populated from `title + description` for old frontend code; old documents with only `ritualText` still render correctly
8. **DailyRitual model extended** — added `title`, `description`, `instructions[]`, `durationMinutes`, `difficulty`, `reflectionPrompt`, `reason` fields (all optional, defaults to empty)
9. **RitualLog → AI loop closed** — member logs are fetched and included in next day's ritual prompt

---

## Files Changed (P0 Phase)

### Backend — New Files
- `backend/middleware/rateLimit.js` — rate limiting middleware

### Backend — Modified Files
- `backend/routes/auth.js` — added `/auth/me`, `authLimiter`, password min length (8 chars)
- `backend/routes/ai.js` — complete rewrite: rate limits, membership checks, structured output, culture memory loop, GET endpoint for daily ritual, `findOneAndUpdate` race-condition safety
- `backend/routes/cultures.js` — added `/dashboard` endpoint, added leave-creator guard
- `backend/routes/logs.js` — added membership check, ritualId validation, rich populate
- `backend/models/DailyRitual.js` — extended schema with structured ritual fields
- `backend/models/RitualLog.js` — changed `ritualId` ref from `Ritual` to `DailyRitual`
- `backend/.env.example` — updated to match actual env vars

### Backend — Removed
- `backend/{models,routes,middleware,config}/` — empty artifact directory from bad shell command

### Frontend — Modified Files
- `frontend/src/context/AuthContext.jsx` — added `refreshUser()`, server-side user hydration on mount
- `frontend/src/pages/Dashboard.jsx` — single `/cultures/dashboard` call, error handling, stats display
- `frontend/src/pages/CultureDetail.jsx` — Leave button, error handling, calls `refreshUser()` on join/leave
- `frontend/src/pages/CultureFeed.jsx` — error handling, timestamps, ritual title in log cards
- `frontend/src/pages/DailyRitualPage.jsx` — GET endpoint, sends ritualId with log, displays structured ritual
- `frontend/src/pages/CreateCulture.jsx` — calls `refreshUser()` after publish

## Tests Executed

- 29/29 tests passed in initial test run
- 20/21 tests passed in second run (1 failure: populate ref mismatch, immediately fixed)
- 21/21 tests passed after fixing `RitualLog.ritualId` ref to `DailyRitual`

## Security Improvements

| Issue | Before | After |
|---|---|---|
| Rate limiting | None | 30/hr (AI), 10/hr (blueprint), 20/15min (auth) |
| Membership check on ritual generation | None | Required, HTTP 403 for non-members |
| Membership check on log posting | None | Required, HTTP 403 for non-members |
| Membership check on weekly summary | None | Required, HTTP 403 for non-members |
| Password minimum length | None | 8 characters minimum enforced server-side |
| AI output validation | Partial (arrays only) | Full schema validation with length limits |
| Unauthenticated feed reads | Public | Still public (intentional — culture feeds are visible) |

## Remaining Issues (not in P0 scope)

- P1: Profile page is still static (localStorage only) — needs live data
- P1: Weekly summary has no frontend UI
- P1: Culture edit/delete routes not implemented
- P1: Pagination on feed and explore pages
- P1: Image uploads (Cloudinary) not implemented
- P2: Culture evolution / ritual suggestion system
- P2: Cron-based nightly ritual pre-generation

---

## P1 Implementation Status

> Completed: 2026-09-11

### Design System

**DONE**

- Added `frontend/src/index.css` with glassmorphism utilities (`.glass-panel`, `.glass-panel-interactive`), glow helpers (`.glow-purple`, `.glow-amber`, `.glow-cyan`), gradient text, custom scrollbars, and shimmer animation
- Plus Jakarta Sans (headings/body) + JetBrains Mono (code/meta) loaded via Google Fonts
- Ambient background glow orbs added to `App.jsx` via `.ambient-glow-orb` fixed elements
- Footer added to App.jsx with the product tagline

### Reusable UI Components — NEW

**DONE**

All created in `frontend/src/components/ui/`:
- `GlassPanel.jsx` — Glassmorphic container with interactive hover lift + border transition
- `GlowButton.jsx` — Accessible button with 5 variants (primary/glow/secondary/ghost/danger), sizes (sm/md/lg), and loading spinner; keyboard-navigable with focus ring
- `CultureEmblem.jsx` — Emoji emblem with configurable color ambient glow ring and radial gradient
- `LoadingState.jsx` — Spinner with violet glow blur for ritual/feed/culture loading
- `EmptyState.jsx` — Icon + copy + action CTA for empty feeds and dashboards
- `ErrorState.jsx` — Error icon + retry button for API failures
- `CultureCard.jsx` — Reusable culture preview card with member count, vibe tags, and quick-action links

`frontend/src/components/WeeklySummaryModal.jsx` — AI Weekly Chronicle modal that posts to `/ai/weekly-summary`, shows loading animation, AI summary, and "Rite of the Week" highlight

### NavBar

**DONE**

- `NavBar.jsx` rebuilt with active route highlighting (`NavLink`), user avatar badge, mobile hamburger menu drawer, sticky top + glassmorphic backdrop

### Daily Ritual — Flagship Screen

**DONE**

- `DailyRitualPage.jsx` completely redesigned as the core product experience:
  - Parallel load of culture charter + ritual in a single `Promise.all`
  - "TODAY'S RITE" badge + date, duration/difficulty badges
  - **"Why this rite? (Culture Memory)"** violet rationale callout using the AI `reason` field
  - Interactive step checkboxes (click-to-mark per instruction step)
  - Reflection textarea with 2000 char counter
  - Clear rite completion flow: "Complete & Consecrate" → "✓ Rite Complete" → "Your reflection has become part of the culture's memory."
  - Zero duplicate submission: `completed` state locks form after first submission
  - Full loading / error / completed states throughout

### Culture Detail

**DONE**

- `CultureDetail.jsx` rebuilt with:
  - Full Hero banner with ambient glow orb from culture color
  - Dynamic CTA: visitor → "Join Culture" glow button; member → "Today's Ritual" + "Communal Feed"; non-user → "Sign up to Join"
  - Visitor onboarding explainer card explaining the ritual/memory loop
  - Three-column charter pillars: Sacred Values, Aesthetic Codes, Culture Memory Engine (with live pulse)
  - Sacred Jargon/Lexicon dictionary grid (`term: meaning` split display)
  - Active Ritual Archetypes list
  - Secondary member bar with "View Weekly Chronicle" + "Edit Charter" (founder only)
  - "Leave Culture" with confirmation dialog (protected for creators)
  - Inline Edit Charter modal (PUT /cultures/:id, founder only)
  - Weekly Summary modal integration

### Create Culture Wizard

**DONE**

- `CreateCulture.jsx` redesigned as a 3-step guided wizard:
  - Step 1: The Spark — name, description, vibe keywords
  - Step 2: Symbol & Visual Ethos — 12 preset emoji + custom emoji picker + color picker
  - Step 3: AI Blueprint Review & Edit — full editing with add/remove for values, jargon, rituals
  - Stepper progress indicator at the top
  - "Consecrate & Publish Culture ✦" as final action
  - Navigates immediately to the newly created culture after refreshUser()

### Culture Feed

**DONE**

- `CultureFeed.jsx` rebuilt with:
  - Parallel load of culture + logs
  - "Communal Memory Feed" with "Your Culture Remembers" callout banner
  - Feed cards: member avatar with initial, relative timestamp (`just now` / `12m ago` / `3d ago`), linked Daily Ritual title badge, "Enshrined in cultural memory" footer badge
  - Weekly Chronicle button in header
  - Full loading / error / empty states with EmptyState CTA

### Dashboard

**DONE**

- `Dashboard.jsx` rebuilt with:
  - Welcome banner with user name
  - Stats Ribbon: Joined Cultures / Founded by You / Culture Memory Loop Active & Listening (with pulse)
  - Culture grid using `CultureCard` component with "Today's Rite" action links
  - "Explore More" and "+ New Culture" quick CTAs
  - Full loading / error / empty states

### Profile (Live Data)

**DONE**

- `Profile.jsx` rebuilt with live server data from `GET /auth/me`:
  - User avatar with initial, name, email, "Verified Member" badge
  - Stats: Cultures Joined / Founded / Rites Consecrated (`logsCount`)
  - Founded Cultures list and All Joined Cultures list with CultureEmblem
  - "↻ Refresh Live Data" button, "Log out" danger button

### Explore

**DONE**

- `Explore.jsx` rebuilt with modern search bar (pill shape with icon), quick filter buttons, `CultureCard` grid, and full loading / error / empty states

### Login & Signup

**DONE**

- `Login.jsx` and `Signup.jsx` rebuilt with glass panel styling, labeled inputs, loading states, and clear error handling

### Backend Additions (P1)

**DONE**

- `PUT /cultures/:id` — founder-only culture edit (description, symbol, color, vibeWords, values, aesthetic, jargon)
- `DELETE /cultures/:id` — founder-only culture delete with cascading cleanup (Ritual, RitualLog, User references)
- `GET /auth/me` enriched: now populates `joinedCultures` and `createdCultures` with name/symbol/color/description fields, and adds `logsCount` from `RitualLog.countDocuments`
- `CORS` wildcard fallback removed (SEC-8); explicit allowed origins list
- `PORT` canonicalized to 5001 across `.env` and `server.js`
- AI ritual generation prompt enhanced: jargon incorporation, cliché avoidance, deeper reason rationale

### AI Prompt Quality

**DONE**

Ritual prompt now explicitly:
- Requires 1-2 jargon words embedded in title/instructions
- Strictly prohibits generic wellness clichés ("take a walk", "drink water and breathe") unless culture-specific
- Explains the `reason` in terms of member logs and cultural momentum
- Requires participatory, ceremonial step-by-step instructions

### Security Regression Check

**PASSED — No P0 regressions**

21/21 backend tests passing after all P1 changes.

### Files Changed (P1 Phase)

#### Backend — New / Modified Files
- `backend/routes/cultures.js` — added `PUT /:id`, `DELETE /:id`
- `backend/routes/auth.js` — enriched `/auth/me` with populated cultures + `logsCount`; imported `RitualLog`
- `backend/routes/ai.js` — improved ritual generation prompt quality
- `backend/server.js` — explicit CORS origins; PORT 5001 default
- `backend/.env` — PORT set to 5001
- `backend/test-suite.sh` — updated to self-seed test users and culture if DB is empty

#### Frontend — New UI Component Files
- `frontend/src/components/ui/GlassPanel.jsx` [NEW]
- `frontend/src/components/ui/GlowButton.jsx` [NEW]
- `frontend/src/components/ui/CultureEmblem.jsx` [NEW]
- `frontend/src/components/ui/LoadingState.jsx` [NEW]
- `frontend/src/components/ui/EmptyState.jsx` [NEW]
- `frontend/src/components/ui/ErrorState.jsx` [NEW]
- `frontend/src/components/ui/CultureCard.jsx` [NEW]
- `frontend/src/components/WeeklySummaryModal.jsx` [NEW]

#### Frontend — Modified Files
- `frontend/src/index.css` — full design system with glassmorphism, glows, typography
- `frontend/src/App.jsx` — ambient glow orbs, footer, max-w-6xl layout
- `frontend/src/components/NavBar.jsx` — sticky glass nav, active links, mobile drawer
- `frontend/src/pages/Landing.jsx` — hero with demo teaser, 3-step loop explainer
- `frontend/src/pages/Explore.jsx` — search pill, quick filters, CultureCard grid
- `frontend/src/pages/Login.jsx` — glass panel, loading states, errors
- `frontend/src/pages/Signup.jsx` — glass panel, loading states, client-side pw validation
- `frontend/src/pages/Dashboard.jsx` — stats ribbon, memory loop badge, CultureCard grid
- `frontend/src/pages/DailyRitualPage.jsx` — flagship ritual experience
- `frontend/src/pages/CultureDetail.jsx` — full culture charter, join/leave, weekly modal
- `frontend/src/pages/CultureFeed.jsx` — rich feed cards, memory badge, weekly modal
- `frontend/src/pages/Profile.jsx` — live server data, stats, culture lists
- `frontend/src/pages/CreateCulture.jsx` — 3-step guided wizard

### Tests Passed

- 21/21 backend tests: auth, security, dashboard, AI memory loop, ritual logs, culture detail
- Frontend production build: ✅ 111 modules, 0 errors
- Backend: PUT /cultures/:id (founder edit) — VERIFIED live
- Backend: Weekly Summary AI — VERIFIED live (AI responded correctly)
- Backend: /auth/me logsCount — VERIFIED live (returned 2 logs)

### Remaining Issues (P2 scope)

- Image uploads (Cloudinary) — not in P1 scope
- Culture evolution / ritual suggestion system — P2
- Cron-based nightly ritual pre-generation — P2
- Pagination on feed and explore (currently limit:100) — P2
- httpOnly cookie auth instead of localStorage JWT — P2
- Social reactions (like/react to logs) — P2
- Culture analytics dashboard — P2

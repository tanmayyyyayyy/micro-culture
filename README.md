# Micro Culture

A full-stack website where users create fictional micro-cultures and AI generates daily rituals to keep them alive.

## What this is

- Users create small communities ("micro-cultures") with a name, vibe, and description.
- AI expands that into a full culture blueprint: aesthetic keywords, core values, jargon, starter rituals, and a symbol/emoji.
- Each culture gets a new AI-generated daily ritual, on-theme and consistent with its identity over time.
- Members post short "ritual logs" (text + optional image) in a culture feed.
- AI curates: ritual of the week, weekly summary, suggested new/retired rituals (creator approves).

No streaks, no penalties — this is about identity and vibe, not gamified consistency.

## Stack

- Frontend: React + Vite + Tailwind CSS + React Router + Axios
- Backend: Node.js + Express + JWT auth
- Database: MongoDB + Mongoose
- AI: OpenAI API (or any LLM), backend-only calls, prompt → structured JSON
- Media: Cloudinary (or local disk for MVP)

## Build order (MVP)

1. Auth system (register/login, JWT, protected routes)
2. Culture creation (no AI yet — just the form + DB save)
3. AI culture generation (blueprint from name/vibe/description)
4. Join / leave cultures, discovery/search
5. Daily ritual generator (cron or on-demand, one per culture per day)
6. Ritual logs (post + feed)
7. Culture feed + AI weekly summary / ritual-of-the-week

## Repo layout

```
microculture/
  backend/     Express API, Mongoose models, AI integration
  frontend/    React app (Vite)
  CLAUDE.md    Instructions for Claude Code to continue building this
```

## Running locally

Backend:
```
cd backend
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, OPENAI_API_KEY
npm install
npm run dev
```

Frontend:
```
cd frontend
npm install
npm run dev
```

## Demo Data

To populate realistic demo data for local development & demonstration:

```bash
cd backend
npm run seed:demo
```

- **Development/demo use only**: Refuses execution in production (`NODE_ENV === "production"`).
- **Never automatically executed**: Must be invoked manually.
- **Idempotent**: Safe to run multiple times without duplicating users, cultures, rituals, or logs.
- **Cleanup**: Run `npm run seed:demo:clean` to remove demo-seeded data.

## Deployment

### 1. Backend Service
- **Start Command**: `npm start` (or `node server.js` inside `/backend`)
- **Host Binding**: Binds to `process.env.HOST` (default `0.0.0.0`) and `process.env.PORT` (default `5001`).
- **Required Backend Environment Variables**:
  - `PORT`: HTTP port for server (e.g. `5001`)
  - `HOST`: Bind address for server (e.g. `0.0.0.0`)
  - `MONGO_URI`: MongoDB connection string (`mongodb://...` or `mongodb+srv://...`)
  - `JWT_SECRET`: Secret key for signing authentication tokens
  - `GROQ_API_KEY` (or `OPENAI_API_KEY`): API key for AI daily ritual & blueprint generation
  - `CLIENT_URL`: Allowed frontend origin URL(s) for CORS policy (comma-separated for multiple origins)

### 2. Frontend Static Application
- **Build Command**: `npm run build` inside `/frontend` (outputs static assets to `/frontend/dist`)
- **Required Frontend Environment Variable**:
  - `VITE_API_URL`: Base HTTP URL pointing to the deployed backend service (e.g. `https://api.microculture.example.com`)
- **Architecture**: The frontend is a static single-page React app served by Vite/Nginx/CDN that communicates via REST HTTP calls to the backend API.



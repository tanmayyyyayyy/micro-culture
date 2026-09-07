# CLAUDE.md — Project instructions for Micro Culture

This file is for Claude Code. Read this before making changes.

## Project

See `README.md` for the full spec. Short version: full-stack app where users
create "micro-cultures" and an AI generates daily rituals for each one.

## Current state

This is a scaffold, not a finished app:

- `backend/` has Express set up, Mongoose models for all 5 collections, JWT
  auth (register/login + middleware), culture CRUD + join/leave, ritual log
  routes, and AI routes with placeholder prompts calling OpenAI's API.
- `frontend/` has Vite + React + Tailwind + React Router configured, an auth
  context, an axios instance with the JWT interceptor, and page stubs for
  every route in the spec (some are placeholder UI only).

Nothing has been run yet — `npm install` has not been done in either folder.

## What to do next (in order)

1. `cd backend && npm install`, create `.env` from `.env.example`, confirm
   the server boots (`npm run dev`) and connects to MongoDB.
2. Wire up the frontend the same way, confirm it boots and can hit
   `/auth/register` and `/auth/login`.
3. Flesh out the AI routes (`backend/routes/ai.js`):
   - `generate-culture`: prompt takes {name, vibeWords, description} → returns
     JSON {aesthetic[], values[], jargon[], rituals[5-10], symbol}. Always
     validate/parse the model's JSON output defensively — models sometimes
     wrap JSON in prose or code fences.
   - `generate-ritual`: takes a culture's values/jargon/past rituals → returns
     one on-theme ritual for today. This should be idempotent per
     culture+day (check `DailyRitual` for an existing entry before calling
     the AI again).
   - `weekly-summary`: summarizes a culture's RitualLogs from the past 7 days.
4. Build out the frontend pages to actually call these endpoints and render
   real data (currently many are static placeholders — search for `TODO`).
5. Add image upload (Cloudinary) for ritual logs once the text-only flow works.
6. Only after the above is solid: culture evolution suggestions (optional
   feature — new/retired ritual suggestions requiring creator approval).

## Conventions to follow

- All AI calls happen server-side only (`backend/routes/ai.js`). Never expose
  an API key to the frontend.
- AI prompts should request JSON-only output and the backend should
  `JSON.parse` defensively (strip code fences, try/catch, return a clear
  error rather than crashing).
- Keep routes RESTful and matching the endpoint list in `README.md` — don't
  invent new top-level resources without updating the README.
- No streak/penalty mechanics anywhere — this is explicitly out of scope
  per the product spec.
- Passwords: bcrypt hash only, never store plaintext (already wired in
  `models/User.js` — keep it that way if you touch auth).

## Things to ask the user about before building

- Which LLM/provider key they'll use (OpenAI assumed, but confirm model name).
- Whether daily ritual generation should run on a cron/scheduler or lazily
  on first request each day (scaffold currently assumes lazy/on-demand).
- Cloudinary vs local disk for image storage in the MVP.

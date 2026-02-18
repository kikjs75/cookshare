# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CookShare is a full-stack recipe sharing platform built with TypeScript. The backend is Express.js (port 4000) with SQLite, and the frontend is Next.js 14 App Router (port 3000) with Tailwind CSS and shadcn/ui components.

## Commands

### Backend (`/workspace/backend`)
- `npm run dev` — Start dev server with tsx watch mode (port 4000)
- `npm run build` — Compile TypeScript to `./dist`
- `npm start` — Run compiled output
- `npm run db:migrate` — Initialize/migrate SQLite database

### Frontend (`/workspace/frontend`)
- `npm run dev` — Start Next.js dev server (port 3000)
- `npm run build` — Production build
- `npm run lint` — ESLint with Next.js rules

### First-time setup
```
cd backend && cp .env.example .env && npm install && npm run db:migrate
cd ../frontend && cp .env.local.example .env.local && npm install
```

## Architecture

### Backend layers
Express app → middleware (CORS, JSON, JWT auth, Multer upload) → routes → controllers → database (better-sqlite3 with WAL mode).

- **Routes**: `src/routes/auth.ts` and `src/routes/recipes.ts` define API endpoints under `/api/auth/*` and `/api/recipes/*`
- **Controllers**: `authController.ts` (register/login/me) and `recipeController.ts` (CRUD, likes, image upload) contain all business logic and direct DB queries
- **Middleware**: `auth.ts` verifies JWT Bearer tokens; `upload.ts` handles Multer image uploads (5MB, JPG/PNG/WebP)
- **Storage**: Abstract `StorageService` interface with `LocalStorageService` implementation; S3 is stubbed but not implemented. Controlled by `STORAGE_TYPE` env var
- **Database schema**: `src/db/schema.sql` defines 8 tables: users, recipes, ingredients, steps, tags, recipe_tags, likes, comments

### Frontend layers
Next.js App Router pages → React components → AuthContext (state) → API client (`lib/api.ts` with automatic JWT injection).

- **Pages**: Home (`/`), login/register (`/(auth)/`), recipe detail (`/recipes/[id]`), create recipe (`/recipes/new`)
- **Components**: `ui/` (shadcn primitives), `layout/Navbar.tsx`, `recipe/RecipeCard.tsx`
- **Auth flow**: `AuthContext.tsx` manages user state; tokens stored in localStorage via `lib/auth.ts`
- **Path alias**: `@/*` maps to `src/*` in imports

### Data flow
Frontend form → `lib/api.ts` (adds Bearer token) → Express middleware (JWT verify) → controller (validate + DB ops) → JSON response → frontend state update.

## Database
SQLite via better-sqlite3. Schema lives in `backend/src/db/schema.sql`. Key relationships:
- recipes.author_id → users.id
- ingredients and steps CASCADE on recipe delete
- likes and recipe_tags use composite primary keys
- comments table exists in schema but has no API endpoints yet

## Known issues (from RISK_ANALYSIS.md)
- JWT secret has an unsafe hardcoded default in `authController.ts`
- Recipe update (`PUT /api/recipes/:id`) does not update ingredients, steps, or tags
- No test infrastructure exists yet
- No rate limiting on auth endpoints
- Image upload lacks MIME validation beyond extension check

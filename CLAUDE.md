# Card Chat – Project Guide

## Docs — read these first

| File | What's in it |
|---|---|
| `docs/architecture.md` | System map: auth flow, data isolation rules, data model, draw logic, env vars, DB migration & deploy flow, known gaps |
| `docs/wishlist.md` | Product requirements (single source of truth) with status per item |

Update `docs/architecture.md` whenever you change how the system fits together (new route, auth, schema, env var, deploy step).

## Overview

A Next.js 16 card-drawing app. Users must sign in (NextAuth credentials); all data is per-user. Two main features:
- **Draw** (`/draw`) — filter cards by category/difficulty and draw randomly without repeats
- **Manage** (`/manage`) — CRUD for categories and cards

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 (App Router, `proxy.js` instead of middleware) |
| Runtime | React 19 |
| Package manager | pnpm |
| Lint / Format | Biome (`biome.json`) |
| UI components | Joy UI (`@mui/joy`) |
| Styles | SCSS Modules |
| State | Redux Toolkit + Redux Saga |
| Forms | react-hook-form |
| Auth | NextAuth v5 (Credentials + JWT), bcryptjs |
| Animation | `motion` (`import from 'motion/react'`) |
| Database | Prisma + Turso/libSQL at runtime; local SQLite only for `prisma migrate` |

## Project Structure

```
src/
├── auth.js                 # NextAuth config (Credentials, JWT, normalizeEmail)
├── proxy.js                # Route guard: /draw, /manage need login; /login, /register redirect if signed in
├── app/
│   ├── layout.jsx          # Root layout: SessionProvider + Redux Provider + Joy CssVarsProvider
│   ├── page.jsx            # Redirects to /draw
│   ├── draw/
│   │   ├── page.jsx        # Route entry (can hold metadata)
│   │   ├── content.jsx     # Client-side logic, hooks, dispatch
│   │   └── page.module.scss
│   ├── manage/
│   │   ├── page.jsx
│   │   ├── content.jsx
│   │   └── page.module.scss
│   ├── login/ , register/  # Auth pages (three-file pattern)
│   └── api/
│       ├── auth/[...nextauth]/route.js  # NextAuth handlers
│       ├── auth/register/route.js       # POST sign-up
│       ├── categories/route.js       # GET, POST
│       ├── categories/[id]/route.js  # GET, PATCH, DELETE
│       ├── cards/route.js            # GET (with ?categoryId=&stars=), POST
│       └── cards/[id]/route.js       # GET, PATCH, DELETE
├── components/
│   ├── index.jsx            # Named re-exports
│   ├── DrawDeck/            # Fan of cards + draw/flip animation (motion)
│   ├── NavBar/
│   └── StarRating/
├── hooks/
│   └── use-redux.jsx        # useAppDispatch / useAppSelector
├── lib/
│   └── prisma.jsx           # Singleton PrismaClient (always connects to Turso!)
├── redux/
│   ├── store.js
│   ├── api/apiService.jsx   # the only place that calls fetch (cards, categories, auth register)
│   ├── saga/
│   │   ├── index.jsx        # rootSaga
│   │   ├── cards.jsx        # card sagas + draw pool saga
│   │   └── categories.jsx
│   └── slices/
│       ├── cardsSlice.js
│       ├── categoriesSlice.js
│       └── drawSlice.jsx    # pool, dealOrder, drawnIds, current, filters, exhausted
└── styles/
    └── variables.module.scss  # SCSS design tokens
```

## Page File Contract

Every new page follows the **three-file pattern**:
- `page.jsx` — route entry, metadata only, no client logic
- `content.jsx` — `'use client'`, holds hooks/dispatch/component assembly
- `page.module.scss` — scoped styles, import variables from `@styles/variables.module`

## Data Flow

```
Component dispatch(ACTION)
  → Saga watcher (takeLatest / takeEvery)
  → apiService call (fetch /api/...)
  → Next.js API route → PrismaClient → SQLite
  → put(SET_*) reducer → Redux state → component re-renders
```

**Never call fetch directly in components.** Always go through Redux/Saga.

## Redux Action Naming

- All caps with underscores: `FETCH_CARDS`, `CREATE_CARD`, `SET_CATEGORIES`
- Saga watchers: `takeLatest` for queries/filters, `takeEvery` for mutations

## Draw Logic

`drawSlice.jsx` manages the draw session entirely on the client:
- `pool` — cards fetched with current filters
- `dealOrder` — ids shuffled once (Fisher–Yates) on load / reset; fixed for the round
- `drawnIds` — ids already drawn this session
- `DRAW_CARD(id?)` — draws that id (the card picked in the fan), else the next in `dealOrder`
- `CLOSE_CARD` — hides `current`; the card stays drawn
- `RESET_DRAW` — reshuffles, clears `drawnIds` and `current`
- `exhausted` — true when drawing with nothing left

Fan position `i` = `i`-th undrawn id in `dealOrder`, so the card you pick is the card you get. Details in `docs/architecture.md`.

## Auth & Data Isolation

Every `/api/*` handler (except NextAuth + register) must:
1. `const session = await auth()` → 401 if missing
2. Filter by `userId = Number(session.user.id)` (Card ownership is via `card.category.userId`)
3. Verify any referenced resource (e.g. `categoryId`) also belongs to that user
4. Return 404 for resources that exist but belong to someone else

## Styles

- Use `@use '@styles/variables.module' as v;` at the top of every `.module.scss`
- Colors, spacing, radius, shadow tokens are in `variables.module.scss`
- Follow Joy UI design language for spacing and visual hierarchy

## Database

```bash
pnpm db:generate   # prisma generate
pnpm db:migrate    # prisma migrate dev --name <name> (local SQLite)
pnpm db:push:turso # apply new migrations to Turso — do this BEFORE deploying
pnpm db:studio     # open Prisma Studio
pnpm db:seed       # WIPES and reseeds (seed@example.com / password123)
```

⚠️ `src/lib/prisma.jsx` always connects to Turso, so `pnpm dev` and `pnpm db:seed` hit the **production** database unless `.env` points at a separate Turso DB.

## Development

```bash
pnpm install
pnpm db:migrate
pnpm db:seed       # optional
pnpm dev
```

## Aliases

| Alias | Path |
|---|---|
| `@/*` | `src/*` |
| `@components` | `src/components/index.jsx` |
| `@hooks/*` | `src/hooks/*` |
| `@redux/*` | `src/redux/*` |
| `@styles/*` | `src/styles/*` |

## Do / Don't

**Do:**
- Follow the three-file page contract
- Dispatch actions → let sagas handle API calls
- Use `@styles/variables.module` tokens for all design values
- Validate at API boundary (route handlers), not in sagas
- Use `Controller` for all Joy UI form inputs

**Don't:**
- Call `fetch` directly from components
- Import `PrismaClient` directly — use `src/lib/prisma.jsx`
- Skip the `auth()` + userId check in an API route
- Write inline styles or raw `px` values (use SCSS tokens)
- Use English-only UI text

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

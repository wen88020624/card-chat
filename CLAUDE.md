# Card Chat – Project Guide

## Overview

A Next.js 15 card-drawing app with two main features:
- **Draw** (`/draw`) — filter cards by category/difficulty and draw randomly without repeats
- **Manage** (`/manage`) — CRUD for categories and cards

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 15 (App Router) |
| Runtime | React 19 |
| Package manager | pnpm |
| Lint / Format | Biome (`biome.json`) |
| UI components | Joy UI (`@mui/joy`) |
| Styles | SCSS Modules |
| State | Redux Toolkit + Redux Saga |
| Forms | react-hook-form |
| Database | Prisma + SQLite (`prisma/schema.prisma`) |

## Project Structure

```
src/
├── app/
│   ├── layout.jsx          # Root layout: Redux Provider + Joy CssVarsProvider
│   ├── page.jsx            # Redirects to /draw
│   ├── draw/
│   │   ├── page.jsx        # Route entry (can hold metadata)
│   │   ├── content.jsx     # Client-side logic, hooks, dispatch
│   │   └── page.module.scss
│   ├── manage/
│   │   ├── page.jsx
│   │   ├── content.jsx
│   │   └── page.module.scss
│   └── api/
│       ├── categories/route.js       # GET, POST
│       ├── categories/[id]/route.js  # GET, PATCH, DELETE
│       ├── cards/route.js            # GET (with ?categoryId=&stars=), POST
│       └── cards/[id]/route.js       # GET, PATCH, DELETE
├── components/
│   ├── index.jsx            # Named re-exports
│   ├── NavBar/
│   └── StarRating/
├── hooks/
│   └── use-redux.jsx        # useAppDispatch / useAppSelector
├── lib/
│   └── prisma.js            # Singleton PrismaClient
├── redux/
│   ├── store.js
│   ├── api/apiService.jsx   # fetch wrappers for /api/cards, /api/categories
│   ├── saga/
│   │   ├── index.jsx        # rootSaga
│   │   ├── cards.jsx        # card sagas + draw pool saga
│   │   └── categories.jsx
│   └── slices/
│       ├── cardsSlice.js
│       ├── categoriesSlice.js
│       └── drawSlice.js     # pool, drawnIds, current, filters, exhausted
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

`drawSlice.js` manages the draw session entirely on the client:
- `pool` — cards fetched with current filters
- `drawnIds` — ids already drawn this session
- `DRAW_CARD` — picks a random card from `pool - drawnIds`
- `RESET_DRAW` — clears `drawnIds` and `current`
- `exhausted` — true when all cards have been drawn

## Styles

- Use `@use '@styles/variables.module' as v;` at the top of every `.module.scss`
- Colors, spacing, radius, shadow tokens are in `variables.module.scss`
- Follow Joy UI design language for spacing and visual hierarchy

## Database

```bash
pnpm db:generate   # prisma generate
pnpm db:migrate    # prisma migrate dev --name <name>
pnpm db:studio     # open Prisma Studio
pnpm db:seed       # seed sample data
```

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
- Import `PrismaClient` directly — use `src/lib/prisma.js`
- Write inline styles or raw `px` values (use SCSS tokens)
- Use English-only UI text

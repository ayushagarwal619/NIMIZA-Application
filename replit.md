# Workspace

## Overview

NIMIZA — Interactive Learning Platform for Children (Ages 3–8). A pnpm workspace monorepo with an Expo mobile app and Express REST API backend.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Mobile**: Expo (React Native) with Expo Router

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── mobile/             # Expo mobile app (NIMIZA)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
│   └── src/seed.ts         # Database seeding script
└── ...
```

## Features

### Three Characters
- **Nino** (🧒) — Curious Explorer: Questions, Awareness, Science
- **Miko** (👧) — Kind Friend: Empathy, Sharing, Kindness
- **Zara** (🌟) — Brave Problem Solver: Decisions, Courage, Leadership

### App Screens
- **Home** — Hero with NIMIZA branding, character previews, value cards
- **Characters** — Grid with character cards + detail modal
- **Adventures** — Filterable story cards by skill type
- **Story Player** — Scene-by-scene viewer + quiz + completion badge
- **Progress** — XP bar, level, streak, badges, recently learned

### API Endpoints
- `GET /api/characters` — List all characters
- `GET /api/characters/:id` — Get character by ID
- `POST /api/characters` — Create character
- `GET /api/stories` — List stories (filter by characterId, skill, ageGroup)
- `GET /api/stories/:id` — Get story with scenes and quiz
- `POST /api/stories` — Create story
- `GET /api/progress?userId=...` — Get user progress (XP, level, badges)
- `POST /api/progress` — Save story completion

## Database Schema

- `characters` — Character profiles (name, role, emoji, traits, description)
- `stories` — Story cards (title, emoji, skill, ageGroup, badgeEmoji)
- `scenes` — Story scenes in order (emoji, title, text, character)
- `quiz_questions` — MCQ questions per story
- `progress` — User completion records with quiz scores

## Running

- API Server: `pnpm --filter @workspace/api-server run dev`
- Mobile App: `PORT=5000 pnpm --filter @workspace/mobile run dev`
- Seed DB: `pnpm --filter @workspace/scripts run seed`
- Codegen: `pnpm --filter @workspace/api-spec run codegen`

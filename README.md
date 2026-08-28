# PocketLedger

Offline-first personal finance and expense-sharing mobile app. This repository
currently contains only the initial NestJS API and Expo mobile setup.

## Prerequisites

- Node.js 22 (the project was verified with Node.js 22.19.0)
- npm 11+
- PostgreSQL, only when the API later starts using the database

## Backend

```powershell
cd Backend
Copy-Item .env.example .env
npm install
npm run start:dev
```

The health endpoint is available at `http://localhost:3000/health`.

The initial Prisma schema requires a local PostgreSQL `DATABASE_URL` in
`Backend/.env`. Services must verify that a category belongs to the
authenticated user before creating or updating an expense or budget; foreign
keys alone do not enforce that ownership rule.

Useful checks:

```powershell
npm run build
npm run prisma:validate
```

## Mobile

In a separate terminal:

```powershell
cd Frontend
npm install
npm run start
```

Use Expo Go or an Android/iOS simulator to open the app. Run the static type
check with `npm run typecheck`.

## Current scope

There is deliberately no root `package.json`, Docker, authentication, SQLite,
synchronization, finance domain API, queue, or production feature yet. The
core database schema is defined, but no migration is applied until a valid
local PostgreSQL `DATABASE_URL` is configured. Backend and mobile dependencies
are installed and locked independently.

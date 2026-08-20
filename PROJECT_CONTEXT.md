# PocketLedger — Project Context

Offline-first personal finance & expense-sharing app. React Native (Expo)
+ SQLite on the client, NestJS + PostgreSQL/Prisma + Redis/BullMQ on the
server. Second resume project after Dev Issue Tracker (React Native +
NestJS mobile issue tracker) — built to demonstrate a different
architecture: Dev Issue Tracker was realtime-first, PocketLedger is
offline-first.

## Architecture

React Native UI → Local SQLite → sync_queue (outbox) → (when online) →
NestJS API → PostgreSQL + Prisma → Redis + BullMQ workers

The mobile app always reads from SQLite first. The API syncs in the
background rather than being required for every screen.

## Core entities (backend)

User, Category, Expense, Budget, ExpenseGroup, GroupMember, ExpenseShare,
Settlement, ProcessedOperation, Receipt, RecurringExpense, NotificationJob.

Expense fields: id, userId, amountMinor, currency, description,
expenseDate, categoryId, groupId, createdAt, updatedAt, version, deletedAt.

## Local SQLite tables (frontend)

Mirrors of the syncable backend entities, plus: sync_queue, sync_conflicts,
app_metadata, auth_state.

## Sync flow (binding rules live in AI_RULES.md)

Offline create → SQLite insert with syncStatus=PENDING → sync_queue row
written in the same local transaction → UI updates immediately → on
reconnect, queue processor pushes to NestJS with operationId + baseVersion
→ server checks ProcessedOperation for idempotency, then checks version →
applies or returns conflict → server responds with operationId, server
entity, server version, updatedAt → client marks queue item complete and
updates the local record, or on conflict writes the local version to
sync_conflicts and adopts the server's copy.

## Shared expenses

One expense belongs to a group. ExpenseShare rows define each member's
share. Net balances are computed deterministically per group; Settlement
records reduce outstanding balances. "Who owes whom" logic gets unit
tested independently with worked examples.

## Build phases

1. Monorepo setup, dependency alignment (Expo SDK, Expo Router, SQLite,
   NestJS, Prisma, TypeScript versions pinned together)
2. NestJS auth + PostgreSQL schema (Prisma, all entities above)
3. Expense/category/budget APIs
4. SQLite schema + local expense CRUD
5. Sync queue + connectivity detection
6. Retry handling + idempotent server sync (ProcessedOperation)
7. Conflict detection + sync_conflicts + resolution UI
8. Shared groups + settlements
9. Receipts, notifications, recurring reminders, biometrics
10. Charts, dark mode, swipe actions, testing, docs

## Manual test scenarios (must pass before calling sync "done")

- Create expense offline, reconnect, verify sync
- Retry after simulated server/network failure
- Submit the same operationId twice — verify no duplicate
- Edit the same expense on two devices — verify conflict lands in
  sync_conflicts, not silently overwritten
- Delete while another update to the same row is still pending — delete
  must win
- Sync a shared group expense end-to-end and verify settlement math

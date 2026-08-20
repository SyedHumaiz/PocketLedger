# AI Rules — PocketLedger

These rules apply to all code generated in this repo. Do not deviate
without being told explicitly in the prompt.

## Identity & security
- The backend always takes the user's identity from the authenticated JWT
  (`req.user`), never from the request body. Never trust a `userId` field
  sent by the client.
- All DTOs use strict whitelisting validation (class-validator,
  `whitelist: true`, `forbidNonWhitelisted: true`).

## Data conventions
- Money is always an integer in minor units (`amountMinor`), currency-
  agnostic — never a float.
- All timestamps stored and transmitted in UTC.
- Every syncable entity has: client-generated UUID `id`, `version` (int),
  `updatedAt`, `deletedAt` (tombstone — never hard-delete a synced row).

## Sync rules
- Every offline mutation gets a unique `operationId` generated on the
  client and is written to the local `sync_queue` table in the SAME local
  transaction as the entity write itself — the queue can never drift from
  local state.
- The server enforces idempotency on `operationId` via a
  `ProcessedOperation` table, checked inside the same transaction as the
  write: a retried operation returns the original result and is never
  applied twice.
- Conflict resolution is record-level for v1, using `version` +
  `baseVersion` (the version the client last saw). On a version mismatch,
  the server's copy wins and is returned to the client — EXCEPT a delete
  always wins over a concurrent update (never resurrect a tombstoned row).
  The client's losing local version is written to a local `sync_conflicts`
  table, not discarded, so a "review conflicts" screen can surface it
  later. Never silently overwrite without recording what was lost.
- Retries use attempt-based backoff tracked per `sync_queue` row
  (attempt 1 → short delay, attempt 2 → longer, attempt 3 → longer, then
  status = FAILED and stop auto-retrying). Temporary errors (network
  failure, 5xx) retry; permanent errors (validation, 4xx) go straight to
  FAILED without retrying.

## Style
- Keep sync logic explicit and readable — no clever generic abstraction
  hiding the push/pull/retry flow. Favor straightforward, inspectable code.
- TypeScript strict mode on both Backend and Frontend.

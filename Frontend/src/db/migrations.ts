export interface DatabaseMigration { version:number; sql:string; }
export const databaseMigrations: readonly DatabaseMigration[] = [{ version:1, sql:`
CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY,userId TEXT NOT NULL,name TEXT NOT NULL,normalizedName TEXT NOT NULL,createdAt TEXT NOT NULL,updatedAt TEXT NOT NULL,deletedAt TEXT,syncStatus TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS expenses (id TEXT PRIMARY KEY,userId TEXT NOT NULL,categoryId TEXT,amountMinor INTEGER NOT NULL,currency TEXT NOT NULL,description TEXT NOT NULL,expenseDate TEXT NOT NULL,createdAt TEXT NOT NULL,updatedAt TEXT NOT NULL,version INTEGER NOT NULL,deletedAt TEXT,syncStatus TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS expenses_userId_expenseDate_idx ON expenses(userId,expenseDate DESC);
CREATE TABLE IF NOT EXISTS budgets (id TEXT PRIMARY KEY,userId TEXT NOT NULL,categoryId TEXT,amountMinor INTEGER NOT NULL,month INTEGER NOT NULL,year INTEGER NOT NULL,createdAt TEXT NOT NULL,updatedAt TEXT NOT NULL,deletedAt TEXT,syncStatus TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sync_queue (operationId TEXT PRIMARY KEY,entityType TEXT NOT NULL,entityId TEXT NOT NULL,operationType TEXT NOT NULL,payloadJson TEXT NOT NULL,attempts INTEGER NOT NULL,status TEXT NOT NULL,lastError TEXT,nextAttemptAt TEXT,createdAt TEXT NOT NULL,updatedAt TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS app_metadata (key TEXT PRIMARY KEY,value TEXT NOT NULL,updatedAt TEXT NOT NULL);` },{ version:2, sql:`
CREATE TABLE IF NOT EXISTS sync_conflicts (id TEXT PRIMARY KEY,operationId TEXT NOT NULL,entityType TEXT NOT NULL,entityId TEXT NOT NULL,localPayloadJson TEXT NOT NULL,serverPayloadJson TEXT NOT NULL,createdAt TEXT NOT NULL,resolvedAt TEXT);
CREATE INDEX IF NOT EXISTS sync_queue_status_nextAttemptAt_idx ON sync_queue(status,nextAttemptAt,createdAt);
CREATE INDEX IF NOT EXISTS sync_conflicts_entity_idx ON sync_conflicts(entityType,entityId,createdAt DESC);` },{ version:3, sql:`
CREATE TABLE IF NOT EXISTS user_preferences (userId TEXT PRIMARY KEY,defaultCurrency TEXT NOT NULL DEFAULT 'PKR',showDecimalPlaces INTEGER NOT NULL DEFAULT 1,updatedAt TEXT NOT NULL);` },{ version:4, sql:`
CREATE TABLE IF NOT EXISTS expense_receipts (id TEXT PRIMARY KEY,userId TEXT NOT NULL,expenseId TEXT NOT NULL,localUri TEXT NOT NULL,capturedAt TEXT NOT NULL,deletedAt TEXT);
CREATE INDEX IF NOT EXISTS expense_receipts_userId_idx ON expense_receipts(userId);
CREATE INDEX IF NOT EXISTS expense_receipts_expenseId_idx ON expense_receipts(expenseId);` },{ version:5, sql:`
ALTER TABLE user_preferences ADD COLUMN biometricLockEnabled INTEGER NOT NULL DEFAULT 0;` },{ version:6, sql:`
CREATE TABLE IF NOT EXISTS recurring_expenses (id TEXT PRIMARY KEY,userId TEXT NOT NULL,title TEXT NOT NULL,amountMinor INTEGER NOT NULL,currency TEXT NOT NULL,categoryId TEXT,frequency TEXT NOT NULL,nextDueAt TEXT NOT NULL,enabled INTEGER NOT NULL,notificationId TEXT,createdAt TEXT NOT NULL,updatedAt TEXT NOT NULL,deletedAt TEXT);
CREATE INDEX IF NOT EXISTS recurring_expenses_userId_idx ON recurring_expenses(userId);
CREATE INDEX IF NOT EXISTS recurring_expenses_nextDueAt_idx ON recurring_expenses(nextDueAt);
CREATE INDEX IF NOT EXISTS recurring_expenses_enabled_idx ON recurring_expenses(enabled);` },{ version:7, sql:`
ALTER TABLE expense_receipts ADD COLUMN syncStatus TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE expense_receipts ADD COLUMN remoteReceiptId TEXT;
ALTER TABLE expense_receipts ADD COLUMN attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE expense_receipts ADD COLUMN lastError TEXT;
ALTER TABLE expense_receipts ADD COLUMN updatedAt TEXT NOT NULL DEFAULT '';
UPDATE expense_receipts SET updatedAt=capturedAt WHERE updatedAt='';
CREATE INDEX IF NOT EXISTS expense_receipts_syncStatus_idx ON expense_receipts(syncStatus,updatedAt);` },{ version:8, sql:`
CREATE TABLE IF NOT EXISTS cached_groups (id TEXT NOT NULL,userId TEXT NOT NULL,payloadJson TEXT NOT NULL,updatedAt TEXT NOT NULL,PRIMARY KEY(id,userId));
CREATE TABLE IF NOT EXISTS cached_group_members (groupId TEXT NOT NULL,userId TEXT NOT NULL,memberId TEXT NOT NULL,payloadJson TEXT NOT NULL,PRIMARY KEY(groupId,userId,memberId));
CREATE TABLE IF NOT EXISTS cached_group_expenses (id TEXT NOT NULL,groupId TEXT NOT NULL,userId TEXT NOT NULL,payloadJson TEXT NOT NULL,updatedAt TEXT NOT NULL,PRIMARY KEY(id,userId));
CREATE TABLE IF NOT EXISTS cached_group_shares (expenseId TEXT NOT NULL,userId TEXT NOT NULL,shareUserId TEXT NOT NULL,payloadJson TEXT NOT NULL,PRIMARY KEY(expenseId,userId,shareUserId));
CREATE TABLE IF NOT EXISTS cached_settlements (id TEXT NOT NULL,groupId TEXT NOT NULL,userId TEXT NOT NULL,payloadJson TEXT NOT NULL,PRIMARY KEY(id,userId));
CREATE TABLE IF NOT EXISTS cached_group_balances (groupId TEXT NOT NULL,userId TEXT NOT NULL,balanceUserId TEXT NOT NULL,payloadJson TEXT NOT NULL,PRIMARY KEY(groupId,userId,balanceUserId));
CREATE TABLE IF NOT EXISTS cached_settlement_suggestions (groupId TEXT NOT NULL,userId TEXT NOT NULL,position INTEGER NOT NULL,payloadJson TEXT NOT NULL,PRIMARY KEY(groupId,userId,position));
CREATE TABLE IF NOT EXISTS group_cache_metadata (groupId TEXT NOT NULL,userId TEXT NOT NULL,refreshedAt TEXT NOT NULL,PRIMARY KEY(groupId,userId));
CREATE INDEX IF NOT EXISTS cached_groups_userId_idx ON cached_groups(userId);` }];
export function migrationsAfter(version:number,migrations=databaseMigrations):DatabaseMigration[]{return [...migrations].filter(m=>m.version>version).sort((a,b)=>a.version-b.version);}

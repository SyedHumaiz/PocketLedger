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
CREATE INDEX IF NOT EXISTS sync_conflicts_entity_idx ON sync_conflicts(entityType,entityId,createdAt DESC);` }];
export function migrationsAfter(version:number,migrations=databaseMigrations):DatabaseMigration[]{return [...migrations].filter(m=>m.version>version).sort((a,b)=>a.version-b.version);}

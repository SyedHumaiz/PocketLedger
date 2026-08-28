import * as SQLite from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';
import { databaseMigrations, migrationsAfter } from './migrations';
let databasePromise:Promise<SQLiteDatabase>|undefined;
export async function getDatabase():Promise<SQLiteDatabase>{databasePromise??=openAndMigrate();return databasePromise;}
async function openAndMigrate(){const db=await SQLite.openDatabaseAsync('pocketledger.db');await applyMigrations(db);return db;}
export async function getSchemaVersion(db:SQLiteDatabase){return (await db.getFirstAsync<{user_version:number}>('PRAGMA user_version'))?.user_version??0;}
export async function applyMigrations(db:SQLiteDatabase){for(const migration of migrationsAfter(await getSchemaVersion(db),databaseMigrations)){await db.withTransactionAsync(async()=>{await db.execAsync(migration.sql);await db.execAsync(`PRAGMA user_version = ${migration.version}`);});}}
export async function runTransaction<T>(db:SQLiteDatabase,work:(transaction:SQLiteDatabase)=>Promise<T>):Promise<T>{let result:T|undefined;await db.withTransactionAsync(async()=>{result=await work(db);});return result as T;}
export async function closeDatabase(){if(!databasePromise)return;const db=await databasePromise;await db.closeAsync();databasePromise=undefined;}

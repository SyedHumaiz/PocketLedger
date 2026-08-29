import type { SQLiteDatabase } from 'expo-sqlite';
import { transitionSyncQueue, type SyncFailure } from './sync-queue-state';
import type { LocalExpenseRecord, SyncConflictRecord, SyncOperationType, SyncQueueRecord } from './types';

export interface EnqueueSyncOperationInput { operationId:string; entityType:string; entityId:string; operationType:SyncOperationType; payload:unknown; timestamp?:string; }

export async function enqueueSyncOperation(db:SQLiteDatabase,input:EnqueueSyncOperationInput):Promise<SyncQueueRecord>{
  const timestamp=input.timestamp??new Date().toISOString();
  const record:SyncQueueRecord={operationId:input.operationId,entityType:input.entityType,entityId:input.entityId,operationType:input.operationType,payloadJson:JSON.stringify(input.payload),attempts:0,status:'PENDING',lastError:null,nextAttemptAt:null,createdAt:timestamp,updatedAt:timestamp};
  await db.runAsync('INSERT INTO sync_queue (operationId,entityType,entityId,operationType,payloadJson,attempts,status,lastError,nextAttemptAt,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)',record.operationId,record.entityType,record.entityId,record.operationType,record.payloadJson,record.attempts,record.status,record.lastError,record.nextAttemptAt,record.createdAt,record.updatedAt);
  return record;
}

export function listDueSyncOperations(db:SQLiteDatabase,now:string=new Date().toISOString(),limit:number=50):Promise<SyncQueueRecord[]>{return db.getAllAsync<SyncQueueRecord>('SELECT * FROM sync_queue WHERE status=? AND (nextAttemptAt IS NULL OR nextAttemptAt<=?) ORDER BY createdAt ASC LIMIT ?', 'PENDING',now,limit);}
export const getSyncOperation=(db:SQLiteDatabase,operationId:string)=>db.getFirstAsync<SyncQueueRecord>('SELECT * FROM sync_queue WHERE operationId=?',operationId);
export const listSyncOperations=(db:SQLiteDatabase)=>db.getAllAsync<SyncQueueRecord>('SELECT * FROM sync_queue ORDER BY createdAt DESC');

export async function markSyncOperationProcessing(db:SQLiteDatabase,record:SyncQueueRecord,now:Date=new Date()):Promise<boolean>{return updateTransition(db,record,'START',now);}
export async function markSyncOperationSucceeded(db:SQLiteDatabase,record:SyncQueueRecord,now:Date=new Date()):Promise<boolean>{return updateTransition(db,record,'SUCCEED',now);}
export async function markSyncOperationFailed(db:SQLiteDatabase,record:SyncQueueRecord,error:SyncFailure,retryable:boolean,now:Date=new Date()):Promise<boolean>{return updateTransition(db,record,{type:'FAIL',error,retryable},now);}
export async function recoverStaleProcessingOperations(db:SQLiteDatabase,staleBefore:string,now:string=new Date().toISOString()):Promise<number>{const result=await db.runAsync('UPDATE sync_queue SET status=?,nextAttemptAt=?,updatedAt=? WHERE status=? AND updatedAt<?','PENDING',null,now,'PROCESSING',staleBefore);return result.changes;}
export async function releaseSyncOperationClaim(db:SQLiteDatabase,record:SyncQueueRecord,now:string=new Date().toISOString()):Promise<boolean>{const result=await db.runAsync('UPDATE sync_queue SET status=?,nextAttemptAt=?,updatedAt=? WHERE operationId=? AND status=?','PENDING',null,now,record.operationId,'PROCESSING');return result.changes===1;}

export async function completeExpenseSyncOperation(db:SQLiteDatabase,record:SyncQueueRecord,expense:LocalExpenseRecord):Promise<boolean>{return inTransaction(db,async tx=>{const synced=transitionSyncQueue(record,{type:'SUCCEED'});const queueResult=await tx.runAsync('UPDATE sync_queue SET status=?,attempts=?,lastError=?,nextAttemptAt=?,updatedAt=? WHERE operationId=? AND status=?',synced.status,synced.attempts,synced.lastError,synced.nextAttemptAt,synced.updatedAt,record.operationId,record.status);if(queueResult.changes!==1)return false;await tx.runAsync('UPDATE expenses SET categoryId=?,amountMinor=?,currency=?,description=?,expenseDate=?,updatedAt=?,version=?,deletedAt=?,syncStatus=? WHERE id=?',expense.categoryId,expense.amountMinor,expense.currency,expense.description,expense.expenseDate,expense.updatedAt,expense.version,expense.deletedAt,'SYNCED',expense.id);return true;});}

export async function markExpenseSyncConflict(db:SQLiteDatabase,record:SyncQueueRecord,localExpense:LocalExpenseRecord|null,serverExpense:unknown,conflictId:string,now:string=new Date().toISOString()):Promise<boolean>{return inTransaction(db,async tx=>{const transition=transitionSyncQueue(record,{type:'CONFLICT'},new Date(now));const queueResult=await tx.runAsync('UPDATE sync_queue SET status=?,attempts=?,lastError=?,nextAttemptAt=?,updatedAt=? WHERE operationId=? AND status=?',transition.status,transition.attempts,transition.lastError,transition.nextAttemptAt,transition.updatedAt,record.operationId,record.status);if(queueResult.changes!==1)return false;const conflict:SyncConflictRecord={id:conflictId,operationId:record.operationId,entityType:record.entityType,entityId:record.entityId,localPayloadJson:JSON.stringify({operation:JSON.parse(record.payloadJson),expense:localExpense}),serverPayloadJson:JSON.stringify(serverExpense),createdAt:now,resolvedAt:null};await tx.runAsync('INSERT INTO sync_conflicts (id,operationId,entityType,entityId,localPayloadJson,serverPayloadJson,createdAt,resolvedAt) VALUES (?,?,?,?,?,?,?,?)',conflict.id,conflict.operationId,conflict.entityType,conflict.entityId,conflict.localPayloadJson,conflict.serverPayloadJson,conflict.createdAt,conflict.resolvedAt);return true;});}

async function updateTransition(db:SQLiteDatabase,record:SyncQueueRecord,event:'START'|'SUCCEED'|{type:'FAIL';error:SyncFailure;retryable:boolean},now:Date):Promise<boolean>{
  const transition=transitionSyncQueue(record,typeof event==='string'?{type:event}:event,now);
  const result=await db.runAsync('UPDATE sync_queue SET status=?,attempts=?,lastError=?,nextAttemptAt=?,updatedAt=? WHERE operationId=? AND status=?',transition.status,transition.attempts,transition.lastError,transition.nextAttemptAt,transition.updatedAt,record.operationId,record.status);
  return result.changes===1;
}
async function inTransaction<T>(db:SQLiteDatabase,work:(transaction:SQLiteDatabase)=>Promise<T>):Promise<T>{let result:T|undefined;await db.withTransactionAsync(async()=>{result=await work(db);});return result as T;}

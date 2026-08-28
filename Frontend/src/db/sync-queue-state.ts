import type { SyncQueueRecord, SyncQueueStatus } from './types';

export const MAX_SYNC_ATTEMPTS = 3;
const retryDelaysMs = [5_000, 30_000] as const;

export interface SyncFailure { message:string; statusCode?:number; }
export type SyncQueueEvent = { type:'START' } | { type:'SUCCEED' } | { type:'CONFLICT' } | { type:'FAIL'; error:SyncFailure; retryable:boolean };
export interface SyncQueueTransition { status:SyncQueueStatus; attempts:number; lastError:string|null; nextAttemptAt:string|null; updatedAt:string; }

export function retryDelayMs(attempt:number):number|null{return retryDelaysMs[attempt-1]??null;}
export function isRetryableSyncError(error:SyncFailure):boolean{return error.statusCode===undefined||error.statusCode>=500;}
export function transitionSyncQueue(record:SyncQueueRecord,event:SyncQueueEvent,now:Date=new Date()):SyncQueueTransition{
  const updatedAt=now.toISOString();
  if(event.type==='START'){
    if(record.status!=='PENDING')throw new Error(`Cannot start a ${record.status} sync operation.`);
    return {status:'PROCESSING',attempts:record.attempts,lastError:record.lastError,nextAttemptAt:null,updatedAt};
  }
  if(event.type==='SUCCEED'){
    if(record.status!=='PROCESSING')throw new Error(`Cannot complete a ${record.status} sync operation.`);
    return {status:'SYNCED',attempts:record.attempts,lastError:null,nextAttemptAt:null,updatedAt};
  }
  if(event.type==='CONFLICT'){
    if(record.status!=='PROCESSING')throw new Error(`Cannot conflict a ${record.status} sync operation.`);
    return {status:'CONFLICT',attempts:record.attempts,lastError:null,nextAttemptAt:null,updatedAt};
  }
  if(record.status!=='PROCESSING')throw new Error(`Cannot fail a ${record.status} sync operation.`);
  const attempts=record.attempts+1;
  const delay=event.retryable&&attempts<MAX_SYNC_ATTEMPTS?retryDelayMs(attempts):null;
  return {status:delay===null?'FAILED':'PENDING',attempts,lastError:event.error.message,nextAttemptAt:delay===null?null:new Date(now.getTime()+delay).toISOString(),updatedAt};
}

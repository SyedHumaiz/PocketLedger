import assert from 'node:assert/strict';
import test from 'node:test';
import { isRetryableSyncError, MAX_SYNC_ATTEMPTS, retryDelayMs, transitionSyncQueue } from './sync-queue-state';
import type { SyncQueueRecord } from './types';

const timestamp='2026-08-28T00:00:00.000Z';
const pending:SyncQueueRecord={operationId:'operation',entityType:'expense',entityId:'expense',operationType:'CREATE',payloadJson:'{}',attempts:0,status:'PENDING',lastError:null,nextAttemptAt:null,createdAt:timestamp,updatedAt:timestamp};
const now=new Date(timestamp);
test('moves a queued operation through processing to synced',()=>{const processing=transitionSyncQueue(pending,{type:'START'},now);assert.equal(processing.status,'PROCESSING');const synced=transitionSyncQueue({...pending,...processing},{type:'SUCCEED'},now);assert.deepEqual(synced,{status:'SYNCED',attempts:0,lastError:null,nextAttemptAt:null,updatedAt:timestamp});});
test('retries temporary failures with attempt backoff',()=>{const processing=transitionSyncQueue(pending,{type:'START'},now);const retry=transitionSyncQueue({...pending,...processing},{type:'FAIL',error:{message:'offline'},retryable:true},now);assert.equal(retry.status,'PENDING');assert.equal(retry.attempts,1);assert.equal(retry.nextAttemptAt,'2026-08-28T00:00:05.000Z');assert.equal(retryDelayMs(2),30_000);});
test('stops retrying after the configured maximum and on permanent failures',()=>{const processing={...pending,status:'PROCESSING' as const,attempts:MAX_SYNC_ATTEMPTS-1};assert.equal(transitionSyncQueue(processing,{type:'FAIL',error:{message:'timeout'},retryable:true},now).status,'FAILED');assert.equal(transitionSyncQueue({...pending,status:'PROCESSING'},{type:'FAIL',error:{message:'bad input',statusCode:422},retryable:false},now).status,'FAILED');});
test('classifies network and 5xx errors as retryable',()=>{assert.equal(isRetryableSyncError({message:'offline'}),true);assert.equal(isRetryableSyncError({message:'server',statusCode:503}),true);assert.equal(isRetryableSyncError({message:'invalid',statusCode:400}),false);});
test('rejects invalid transitions',()=>assert.throws(()=>transitionSyncQueue(pending,{type:'SUCCEED'},now)));

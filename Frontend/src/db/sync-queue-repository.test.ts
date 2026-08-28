import assert from 'node:assert/strict';
import test from 'node:test';
import { enqueueSyncOperation, listDueSyncOperations } from './sync-queue-repository';

test('enqueues a pending operation with a serialized payload',async()=>{const calls:unknown[][]=[];const db={runAsync:async(...args:unknown[])=>{calls.push(args);return {changes:1};}};const record=await enqueueSyncOperation(db as never,{operationId:'operation',entityType:'expense',entityId:'expense',operationType:'CREATE',payload:{amountMinor:250},timestamp:'2026-08-28T00:00:00.000Z'});assert.equal(record.status,'PENDING');assert.equal(record.payloadJson,'{"amountMinor":250}');assert.equal(calls.length,1);assert.match(calls[0]?.[0] as string,/INSERT INTO sync_queue/);});
test('lists only pending operations whose retry window has elapsed',async()=>{let query:unknown[]=[];const db={getAllAsync:async(...args:unknown[])=>{query=args;return [];}};await listDueSyncOperations(db as never,'2026-08-28T00:00:00.000Z',10);assert.match(query[0] as string,/status=\?/);assert.deepEqual(query.slice(1),['PENDING','2026-08-28T00:00:00.000Z',10]);});

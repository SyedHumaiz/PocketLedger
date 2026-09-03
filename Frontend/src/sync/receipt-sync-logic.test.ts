import assert from 'node:assert/strict';
import test from 'node:test';
import { canUploadReceipt,isRetryableReceiptFailure,receiptUploadTransition,recoveredReceiptStatus } from './receipt-sync-logic';
test('uploads only after the parent expense is synchronized and never deleted receipts',()=>{assert.equal(canUploadReceipt('SYNCED','PENDING',null),true);assert.equal(canUploadReceipt('PENDING','PENDING',null),false);assert.equal(canUploadReceipt('SYNCED','PENDING','2026-01-01'),false);});
test('maps successful, retryable, and permanent receipt upload outcomes',()=>{assert.equal(receiptUploadTransition(true,false),'SYNCED');assert.equal(receiptUploadTransition(false,true),'PENDING');assert.equal(receiptUploadTransition(false,false),'FAILED');assert.equal(isRetryableReceiptFailure(undefined),true);assert.equal(isRetryableReceiptFailure(503),true);assert.equal(isRetryableReceiptFailure(415),false);});
test('recovers stale uploads while preserving the offline local receipt',()=>{assert.equal(recoveredReceiptStatus('UPLOADING','2026-01-01','2026-01-02'),'PENDING');assert.equal(recoveredReceiptStatus('SYNCED','2026-01-01','2026-01-02'),'SYNCED');});
test('does not permit an already uploading or synced receipt to be queued again',()=>{assert.equal(canUploadReceipt('SYNCED','UPLOADING',null),false);assert.equal(canUploadReceipt('SYNCED','SYNCED',null),false);});

import test from 'node:test';
import assert from 'node:assert/strict';
import { receiptAttachedLabel } from './receipt-logic';
test('maps receipt attached display states',()=>{assert.equal(receiptAttachedLabel(0),'No receipt attached');assert.equal(receiptAttachedLabel(1),'1 receipt attached');assert.equal(receiptAttachedLabel(2),'2 receipts attached');});

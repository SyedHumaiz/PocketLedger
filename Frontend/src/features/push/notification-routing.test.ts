import assert from 'node:assert/strict';
import test from 'node:test';
import { notificationTarget } from './notification-routing';
const groupId='11111111-1111-4111-8111-111111111111';
test('routes valid group and settlement data only when a valid group ID exists',()=>{assert.deepEqual(notificationTarget({type:'group',groupId}),{kind:'group',groupId});assert.deepEqual(notificationTarget({type:'settlement',groupId}),{kind:'group',groupId});assert.deepEqual(notificationTarget({type:'group',groupId:'not-a-group'}),{kind:'home'});});
test('routes a valid recurring reminder without creating an expense',()=>assert.deepEqual(notificationTarget({type:'recurring-reminder'}),{kind:'recurring'}));
test('falls back safely for malformed or unknown notification data',()=>{assert.deepEqual(notificationTarget(null),{kind:'home'});assert.deepEqual(notificationTarget({type:'unknown',url:'pocketledger://evil'}),{kind:'home'});assert.deepEqual(notificationTarget(['group']),{kind:'home'});});

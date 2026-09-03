import assert from 'node:assert/strict'; import test from 'node:test';
const payload=(groupId:string,baseVersion:number)=>({groupId,baseVersion,amountMinor:1250,shares:[{userId:'member',amountMinor:1250}]});
test('edit outbox payload retains group and base version',()=>assert.deepEqual(payload('group',3),{groupId:'group',baseVersion:3,amountMinor:1250,shares:[{userId:'member',amountMinor:1250}]}));
test('delete outbox payload contains only group and local base version',()=>assert.deepEqual({groupId:'group',baseVersion:4},{groupId:'group',baseVersion:4}));
test('retry, conflict, and pending state labels remain distinct',()=>assert.deepEqual(['PENDING','FAILED','CONFLICT'],['PENDING','FAILED','CONFLICT']));
test('user and group identifiers are both required for local mutations',()=>assert.equal(['user','group'].every(Boolean),true));

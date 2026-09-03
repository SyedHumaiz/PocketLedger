import assert from 'node:assert/strict'; import test from 'node:test';
const available=(members:string[],shares:string[])=>({members,shares:members.map(id=>shares.includes(id)?id:'') ,removed:shares.filter(id=>!members.includes(id))});
test('uses current cached group members for edit options',()=>assert.deepEqual(available(['a','b'],['a']),{members:['a','b'],shares:['a',''],removed:[]}));
test('preserves existing shares for members still in the group',()=>assert.deepEqual(available(['a','b'],['b']),{members:['a','b'],shares:['','b'],removed:[]}));
test('flags removed members and never offers another group member',()=>assert.deepEqual(available(['a'],['a','foreign']),{members:['a'],shares:['a'],removed:['foreign']}));
test('cached member selection is available without network state',()=>assert.equal(available(['a'],[]).members[0],'a'));

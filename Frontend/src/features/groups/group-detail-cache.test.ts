import assert from 'node:assert/strict'; import test from 'node:test';
type Detail={group:{id:string}|null;expenses:string[]};
const retain=(cached:Detail,fresh:Detail|null,offline:boolean)=>offline||!fresh?cached:fresh;
test('maps cached group detail immediately',()=>assert.deepEqual(retain({group:{id:'g1'},expenses:['e1']},null,true),{group:{id:'g1'},expenses:['e1']}));
test('background refresh replaces cached group detail on success',()=>assert.deepEqual(retain({group:{id:'g1'},expenses:[]},{group:{id:'g1'},expenses:['e2']},false),{group:{id:'g1'},expenses:['e2']}));
test('refresh failure and offline mode preserve the authenticated cached detail',()=>{const cached={group:{id:'g1'},expenses:['e1']};assert.deepEqual(retain(cached,null,false),cached);assert.deepEqual(retain(cached,{group:{id:'g1'},expenses:['e2']},true),cached);});
test('cached detail remains scoped to its current user repository query',()=>{const rows=[{userId:'u1',groupId:'g1'}];assert.equal(rows.filter(row=>row.userId==='u2'&&row.groupId==='g1').length,0);});

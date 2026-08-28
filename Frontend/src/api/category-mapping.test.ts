import assert from 'node:assert/strict';
import test from 'node:test';
import { mapCategoryResponse } from './category-mapping';
test('maps a category response into a synced local cache record',()=>{assert.deepEqual(mapCategoryResponse({id:'category',name:'Groceries',normalizedName:'groceries',createdAt:'2026-01-01T00:00:00.000Z',updatedAt:'2026-01-02T00:00:00.000Z'},'user'),{id:'category',userId:'user',name:'Groceries',normalizedName:'groceries',createdAt:'2026-01-01T00:00:00.000Z',updatedAt:'2026-01-02T00:00:00.000Z',deletedAt:null,syncStatus:'SYNCED'});});

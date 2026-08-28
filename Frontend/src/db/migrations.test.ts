import assert from 'node:assert/strict'; import test from 'node:test'; import { databaseMigrations, migrationsAfter } from './migrations';
test('orders pending migrations',()=>assert.deepEqual(migrationsAfter(1,[{version:3,sql:''},{version:1,sql:''},{version:2,sql:''}]).map(x=>x.version),[2,3]));
test('adds sync conflicts in migration 2',()=>{const migration=databaseMigrations.find(item=>item.version===2);assert.match(migration?.sql??'',/CREATE TABLE IF NOT EXISTS sync_conflicts/);});

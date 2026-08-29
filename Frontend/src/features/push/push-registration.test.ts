import test from 'node:test'; import assert from 'node:assert/strict'; import { platformFor } from './push-logic';
test('maps supported device platforms safely',()=>{assert.equal(platformFor('android'),'android');assert.equal(platformFor('ios'),'ios');assert.equal(platformFor('windows'),'web');});

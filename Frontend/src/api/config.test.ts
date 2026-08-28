import assert from 'node:assert/strict'; import test from 'node:test'; import { getApiBaseUrl } from './config';
test('validates public API URL',()=>{assert.equal(getApiBaseUrl('http://192.168.1.20:3000/'),'http://192.168.1.20:3000');assert.throws(()=>getApiBaseUrl(undefined));});

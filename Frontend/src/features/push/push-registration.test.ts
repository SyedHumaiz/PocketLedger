import test from 'node:test'; import assert from 'node:assert/strict'; import { isExpoGoAndroid, platformFor, remotePushUnavailable } from './push-logic';
test('maps supported device platforms safely',()=>{assert.equal(platformFor('android'),'android');assert.equal(platformFor('ios'),'ios');assert.equal(platformFor('windows'),'web');});
test('skips remote push registration in Expo Go on Android',()=>{assert.equal(isExpoGoAndroid('android','storeClient'),true);assert.equal(remotePushUnavailable('android','storeClient'),true);});
test('keeps remote push available in Android development builds',()=>{assert.equal(isExpoGoAndroid('android','standalone'),false);assert.equal(remotePushUnavailable('android','standalone'),false);});
test('marks web remote push as unavailable',()=>{assert.equal(remotePushUnavailable('web','storeClient'),true);});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const sourcePath=(relativePath:string)=>fileURLToPath(new URL(relativePath,import.meta.url).href);

test('local notification permission failure is non-blocking', () => {
  const source = readFileSync(sourcePath('./notification-service.ts'), 'utf8');
  assert.match(source, /catch \{ return false; \}/);
  assert.match(source, /catch \{ return null; \}/);
});

test('notification services have no static native notification import or import-time initialization', () => {
  for (const path of ['./notification-service.ts', '../push/push-registration.ts']) {
    const source = readFileSync(sourcePath(path), 'utf8');
    assert.doesNotMatch(source, /^import\s+\*\s+as\s+Notifications/m);
    assert.match(source, /import\('expo-notifications'\)/);
    assert.doesNotMatch(source, /setNotificationHandler|addNotification/);
  }
});

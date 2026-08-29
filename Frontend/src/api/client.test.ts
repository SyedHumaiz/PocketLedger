import assert from 'node:assert/strict';
import test from 'node:test';

import { toApiError } from './api-error';

test('formats backend validation details for display in the registration form', () => {
  const error = toApiError({
    response: { status: 400, data: { message: ['email must be an email'] } },
    message: 'Request failed with status code 400',
  });

  assert.deepEqual(error, { status: 400, message: 'email must be an email' });
});

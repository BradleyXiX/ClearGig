const test = require('node:test');
const assert = require('node:assert/strict');

const { toHttpError } = require('./httpError');

// Prisma surfaces a dead database as an Error with a socket code and a message
// that contains the generated-client source snippet. None of it may reach a
// client - see the "never leaks" test at the bottom.

const connectionError = () => {
  const err = new Error(
    "Invalid `prisma.client.create()` invocation in\n" +
      'C:\\Users\\Admin\\OneDrive\\Desktop\\Source Code\\ClearGig\\backend\\controllers\\clientController.js:25:40'
  );
  err.code = 'ECONNREFUSED';
  return err;
};

test('socket-level connection failure becomes 503 DB_UNAVAILABLE', () => {
  const { status, body } = toHttpError(connectionError());
  assert.equal(status, 503);
  assert.equal(body.code, 'DB_UNAVAILABLE');
  assert.match(body.message, /database/i);
});

test('prisma P1001 unreachable becomes 503', () => {
  const err = new Error('Can not reach database');
  err.code = 'P1001';
  assert.equal(toHttpError(err).status, 503);
});

test('message-only connection failure is still detected', () => {
  const err = new Error("Can't reach database server at `localhost`:5433");
  assert.equal(toHttpError(err).status, 503);
});

test('prisma validation error becomes 400, not 500', () => {
  const err = new Error('Argument `name` is missing.');
  err.name = 'PrismaClientValidationError';
  const { status, body } = toHttpError(err);
  assert.equal(status, 400);
  assert.equal(body.code, 'INVALID_REQUEST');
});

test('unique violation becomes 409', () => {
  const err = new Error('Unique constraint failed');
  err.code = 'P2002';
  const { status, body } = toHttpError(err);
  assert.equal(status, 409);
  assert.equal(body.code, 'CONFLICT');
});

test('unknown error becomes 500 SERVER_ERROR', () => {
  const { status, body } = toHttpError(new Error('boom'));
  assert.equal(status, 500);
  assert.equal(body.code, 'SERVER_ERROR');
});

test('no response body ever leaks the original message or a file path', () => {
  const cases = [connectionError(), Object.assign(new Error('boom'), { name: 'PrismaClientValidationError' }), new Error('boom')];
  for (const err of cases) {
    const serialized = JSON.stringify(toHttpError(err).body);
    assert.ok(!serialized.includes('prisma'), 'body mentions prisma: ' + serialized);
    assert.ok(!serialized.includes('C:\\'), 'body leaks a path: ' + serialized);
    assert.ok(!serialized.includes('boom'), 'body leaks the raw message: ' + serialized);
    assert.equal(toHttpError(err).body.details, undefined);
  }
});

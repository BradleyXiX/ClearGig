// Maps a thrown error to the only thing a client is allowed to see.
//
// Why: the frontend used to render `details: error.message`, which for a dead
// database is Prisma's generated-client snippet complete with an absolute
// Windows path. That is unreadable for a user and a needless disclosure. Every
// error now resolves to a short, stable shape here; the full error goes to the
// server log only.

const SOCKET_CODES = new Set([
  'ECONNREFUSED',
  'ENOTFOUND',
  'ETIMEDOUT',
  'ECONNRESET',
  'EPIPE',
  'EHOSTUNREACH',
]);

// Prisma's own connection codes.
const PRISMA_CONNECTION_CODES = new Set(['P1001', 'P1002', 'P1008', 'P1017']);

const CONNECTION_MESSAGE =
  /(ECONNREFUSED|ENOTFOUND|ETIMEDOUT|ECONNRESET|Can't reach database server|Can not reach database server|Connection terminated|Connection closed|Timed out fetching a new connection)/i;

function isConnectionError(err) {
  if (!err) return false;
  if (SOCKET_CODES.has(err.code)) return true;
  if (PRISMA_CONNECTION_CODES.has(err.code)) return true;
  return CONNECTION_MESSAGE.test(String(err.message ?? ''));
}

function toHttpError(err) {
  if (isConnectionError(err)) {
    return {
      status: 503,
      body: {
        error: 'Database unavailable',
        message: 'The estimate database is not reachable. Start it, then try again.',
        code: 'DB_UNAVAILABLE',
      },
    };
  }

  if (err && err.name === 'PrismaClientValidationError') {
    return {
      status: 400,
      body: {
        error: 'That request could not be saved',
        message: 'Some required fields were missing or invalid. Check the form and try again.',
        code: 'INVALID_REQUEST',
      },
    };
  }

  if (err && err.code === 'P2002') {
    return {
      status: 409,
      body: {
        error: 'That record already exists',
        message: 'A record with those details is already saved.',
        code: 'CONFLICT',
      },
    };
  }

  if (err && err.code === 'P2003') {
    return {
      status: 400,
      body: {
        error: 'Related record missing',
        message: 'That reference does not exist any more. Reload and try again.',
        code: 'INVALID_REQUEST',
      },
    };
  }

  return {
    status: 500,
    body: {
      error: 'Something went wrong',
      message: 'The request could not be completed. Try again.',
      code: 'SERVER_ERROR',
    },
  };
}

module.exports = { toHttpError, isConnectionError };

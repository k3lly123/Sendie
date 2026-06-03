import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from 'crypto';

const HASH_ITERATIONS = 120_000;
const HASH_LENGTH = 32;
const HASH_DIGEST = 'sha256';

const toBase64Url = (value: string) => Buffer.from(value).toString('base64url');
const fromBase64Url = (value: string) => Buffer.from(value, 'base64url').toString('utf8');

export const hashPassword = (password: string, salt = randomBytes(16).toString('hex')) => {
  const derivedKey = pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_LENGTH, HASH_DIGEST).toString('hex');
  return `pbkdf2$${HASH_ITERATIONS}$${salt}$${derivedKey}`;
};

export const verifyPassword = (password: string, hashedPassword: string) => {
  const [scheme, iterationsString, salt, storedHash] = hashedPassword.split('$');

  if (scheme !== 'pbkdf2' || !iterationsString || !salt || !storedHash) {
    return false;
  }

  const iterations = Number(iterationsString);
  const derivedKey = pbkdf2Sync(password, salt, iterations, storedHash.length / 2, HASH_DIGEST);
  const storedBuffer = Buffer.from(storedHash, 'hex');

  return storedBuffer.length === derivedKey.length && timingSafeEqual(storedBuffer, derivedKey);
};

export const signToken = (payload: Record<string, unknown>, secret: string) => {
  const body = toBase64Url(JSON.stringify(payload));
  const signature = createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${signature}`;
};

export const verifyToken = (token: string, secret: string) => {
  const [body, signature] = token.split('.');

  if (!body || !signature) {
    return null;
  }

  const expectedSignature = createHmac('sha256', secret).update(body).digest('base64url');

  if (expectedSignature.length !== signature.length) {
    return null;
  }

  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(body)) as Record<string, unknown>;
    if (typeof payload.exp === 'number' && Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};

export const createToken = (userId: string, secret: string) => {
  return signToken(
    {
      sub: userId,
      iat: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000,
    },
    secret,
  );
};

export const createTrackingId = () => `TRK-${randomBytes(3).toString('hex').toUpperCase()}`;

export const createApiSecret = () => randomBytes(24).toString('hex');

export const createOrderId = () => `ORD-${randomBytes(3).toString('hex').toUpperCase()}`;

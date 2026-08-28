export interface JwtConfiguration {
  secret: string;
  expiresIn: string;
}

const minimumSecretLength = 32;
const unsafeSecretPattern = /change[-_ ]?me|replace[-_ ]?me|example|default|secret/i;
const durationPattern = /^\d+(s|m|h|d)$/;

export function getJwtConfiguration(): JwtConfiguration {
  const secret = process.env.JWT_SECRET?.trim();
  const expiresIn = process.env.JWT_EXPIRES_IN?.trim();

  if (
    !secret ||
    secret.length < minimumSecretLength ||
    unsafeSecretPattern.test(secret)
  ) {
    throw new Error(
      'JWT_SECRET must be a non-placeholder secret of at least 32 characters.',
    );
  }

  if (!expiresIn || !durationPattern.test(expiresIn)) {
    throw new Error('JWT_EXPIRES_IN must be a duration such as 15m or 1h.');
  }

  return { secret, expiresIn };
}

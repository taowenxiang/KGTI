export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'personaquest-default-secret',
  expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as `${number}d` | `${number}h` | `${number}m` | `${number}s`,
};

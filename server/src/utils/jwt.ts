import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { config } from '../config/env.js';
import { AuthUser } from '../types/index.js';

export function generateAccessToken(user: { _id: string | any; email: string }): string {
  return jwt.sign(
    { userId: user._id.toString(), email: user.email, jti: randomUUID() },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn as any }
  );
}

export function generateRefreshToken(user: { _id: string | any; email: string }): string {
  return jwt.sign(
    { userId: user._id.toString(), email: user.email, jti: randomUUID() },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn as any }
  );
}

export function verifyAccessToken(token: string): AuthUser {
  return jwt.verify(token, config.jwt.secret) as AuthUser;
}

export function verifyRefreshToken(token: string): AuthUser {
  return jwt.verify(token, config.jwt.refreshSecret) as AuthUser;
}


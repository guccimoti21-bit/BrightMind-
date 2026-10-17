import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { getDb, verifyPassword, generateSalt } from './db.ts';

export interface AdminSession {
  token: string;
  adminId: string;
  username: string;
  role: string;
  createdAt: number;
  expiresAt: number;
}

// In-memory active sessions
const activeSessions = new Map<string, AdminSession>();

// Rate limiting state: IP -> { failedAttempts, lockoutUntil }
const loginRateLimits = new Map<string, { attempts: number; lockoutUntil: number }>();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours

export function checkLoginRateLimit(ip: string): { allowed: boolean; waitSeconds?: number } {
  const record = loginRateLimits.get(ip);
  if (!record) return { allowed: true };

  const now = Date.now();
  if (record.lockoutUntil > now) {
    const waitSeconds = Math.ceil((record.lockoutUntil - now) / 1000);
    return { allowed: false, waitSeconds };
  }

  // Lockout expired
  if (record.lockoutUntil !== 0 && record.lockoutUntil <= now) {
    loginRateLimits.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedLogin(ip: string): { lockedOut: boolean; waitSeconds?: number } {
  const now = Date.now();
  const record = loginRateLimits.get(ip) || { attempts: 0, lockoutUntil: 0 };
  record.attempts += 1;

  if (record.attempts >= MAX_FAILED_ATTEMPTS) {
    record.lockoutUntil = now + LOCKOUT_DURATION_MS;
    loginRateLimits.set(ip, record);
    return { lockedOut: true, waitSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000) };
  }

  loginRateLimits.set(ip, record);
  return { lockedOut: false };
}

export function resetLoginRateLimit(ip: string): void {
  loginRateLimits.delete(ip);
}

export function createAdminSession(adminId: string, username: string, role: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const session: AdminSession = {
    token,
    adminId,
    username,
    role,
    createdAt: now,
    expiresAt: now + SESSION_DURATION_MS
  };
  activeSessions.set(token, session);
  return token;
}

export function getSession(token: string): AdminSession | null {
  const session = activeSessions.get(token);
  if (!session) return null;

  if (session.expiresAt < Date.now()) {
    activeSessions.delete(token);
    return null;
  }

  return session;
}

export function invalidateSession(token: string): void {
  activeSessions.delete(token);
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization token.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const session = getSession(token);

  if (!session) {
    res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
    return;
  }

  // Attach session info to request
  (req as any).adminSession = session;
  next();
}

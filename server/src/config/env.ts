import dotenv from 'dotenv';
import path from 'path';

// Load .env from root or local
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config(); // fallback to current dir

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:5000',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/nexus',
  jwt: {
    secret: process.env.JWT_SECRET || 'nexus_dev_jwt_secret_key_12345',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'nexus_dev_jwt_refresh_secret_key_67890',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  ai: {
    provider: process.env.AI_PROVIDER || 'gemini',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    callbackUrl: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/integrations/github/callback',
  },
  vapid: {
    publicKey: process.env.VAPID_PUBLIC_KEY || '',
    privateKey: process.env.VAPID_PRIVATE_KEY || '',
    email: process.env.VAPID_EMAIL || 'mailto:support@nexus.app',
  },
  smtp: {
    from: process.env.EMAIL_FROM || 'NEXUS Intelligence <noreply@nexus.app>',
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  desktopSecret: process.env.DESKTOP_APP_SECRET || 'nexus_desktop_agent_shared_secret_2026',
};

export function isOriginAllowed(origin?: string): boolean {
  if (!origin) return true; // Server-to-server, Electron desktop agent, Postman, curl

  const cleanOrigin = origin.replace(/\/+$/, '').toLowerCase();

  if (config.frontendUrl === '*') return true;

  const knownOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://nexus-web-nine-eta.vercel.app',
  ];

  if (config.frontendUrl) {
    config.frontendUrl.split(',').forEach((u) => {
      const cleaned = u.trim().replace(/\/+$/, '').toLowerCase();
      if (cleaned && !knownOrigins.includes(cleaned)) {
        knownOrigins.push(cleaned);
      }
    });
  }

  if (knownOrigins.includes(cleanOrigin)) return true;

  // Allow Vercel preview deployments (*.vercel.app) and Render domains
  try {
    const parsed = new URL(origin);
    const hostname = parsed.hostname.toLowerCase();
    if (hostname.endsWith('.vercel.app') || hostname.endsWith('.onrender.com')) {
      return true;
    }
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return true;
    }
  } catch {}

  return false;
}

export function getAllowedOrigins(): (string | RegExp)[] | boolean {
  return [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://nexus-web-nine-eta.vercel.app',
    /\.vercel\.app$/,
    /\.onrender\.com$/,
  ];
}

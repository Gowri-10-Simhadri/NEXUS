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

export function getAllowedOrigins(): (string | RegExp)[] | boolean {
  if (config.frontendUrl === '*') return true;
  const list: (string | RegExp)[] = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];
  if (config.frontendUrl) {
    config.frontendUrl.split(',').forEach((url) => {
      const trimmed = url.trim();
      if (trimmed && !list.includes(trimmed)) {
        list.push(trimmed);
      }
    });
  }
  return list;
}

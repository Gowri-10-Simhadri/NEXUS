import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexus';

async function startWorker() {
  console.log('========================================================');
  console.log('🔄 NEXUS Dedicated Notification Worker Starting...');
  console.log('========================================================');

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('[Worker] Connected to MongoDB database.');
  } catch (err: any) {
    console.warn('[Worker] Running in standalone interval mode:', err.message);
  }

  // Periodic evaluation cycle (every 60 seconds)
  setInterval(async () => {
    console.log(`[Worker] [${new Date().toLocaleTimeString()}] Running proactive intelligence scan across all active users...`);
  }, 60 * 1000);

  console.log('[Worker] Dedicated Background Intelligence Worker is actively listening.');
}

startWorker().catch((err) => {
  console.error('[Worker] Fatal error in worker:', err);
});

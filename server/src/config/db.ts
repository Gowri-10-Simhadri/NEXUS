import dns from 'dns';
import mongoose from 'mongoose';
import { config } from './env.js';

// Configure reliable DNS servers for Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

let memoryServerInstance: any = null;

export async function connectDB(): Promise<void> {
  mongoose.set('strictQuery', false);

  const primaryUri = config.mongoUri;
  const isAtlas = primaryUri && primaryUri.includes('mongodb+srv');

  // 1. Attempt connection to primary configured MONGODB_URI (e.g. MongoDB Atlas)
  if (primaryUri && primaryUri !== 'mongodb://localhost:27017/nexus' && primaryUri !== 'mongodb://127.0.0.1:27017/nexus') {
    try {
      console.log(`[MongoDB] Attempting connection to configured database (${isAtlas ? 'MongoDB Atlas' : 'Primary URI'})...`);
      const conn = await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[MongoDB] ✅ Successfully connected to ${isAtlas ? 'MongoDB Atlas' : 'Database'} (${conn.connection.host}/${conn.connection.name})`);
      return;
    } catch (error: any) {
      console.warn(`[MongoDB] ⚠️ Connection to primary MONGODB_URI failed: ${error.message}`);
      if (isAtlas) {
        console.warn(`[MongoDB] 💡 Note: If using MongoDB Atlas, check that the Database User exists in Atlas -> Database Access and Network Access allows your IP (0.0.0.0/0).`);
      }
    }
  }

  // 2. Attempt connection to local MongoDB instance
  try {
    console.log(`[MongoDB] Checking local persistent MongoDB instance (mongodb://127.0.0.1:27017/nexus)...`);
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/nexus', {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[MongoDB] ✅ Successfully connected to Local MongoDB (${conn.connection.host}/${conn.connection.name})`);
    return;
  } catch (localErr: any) {
    console.log(`[MongoDB] Local MongoDB on port 27017 not available (${localErr.message}).`);
  }

  // 3. Fallback to MongoMemoryServer for development & standalone stability
  try {
    console.log(`[MongoDB] Initializing local In-Memory MongoDB engine...`);
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServerInstance = await MongoMemoryServer.create();
    const uri = memoryServerInstance.getUri();
    await mongoose.connect(uri);
    console.log(`[MongoDB] ✅ Connected to In-Memory MongoDB (${uri}).`);
  } catch (err: any) {
    console.error(`[MongoDB] ❌ Database initialization failed:`, err.message);
    throw err;
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Database disconnected.');
});

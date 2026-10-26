import mongoose from 'mongoose';
import { env } from './env.js';

let memoryServer = null;

export async function connectDB() {
  try {
    let mongoUri = env.MONGODB_URI;

    if (!mongoUri) {
      console.log('ℹ️ No MONGODB_URI provided. Starting in-memory MongoDB server for zero-config local development/testing...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      mongoUri = memoryServer.getUri();
      console.log(`✅ In-memory MongoDB started at: ${mongoUri}`);
    }

    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
    });

    console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    if (!memoryServer && env.NODE_ENV !== 'production') {
      console.log('⚠️ Falling back to in-memory MongoDB...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        const fallbackUri = memoryServer.getUri();
        const conn = await mongoose.connect(fallbackUri);
        console.log(`✅ Fallback in-memory MongoDB connected: ${conn.connection.host}`);
        return conn;
      } catch (memErr) {
        console.error('Failed to start in-memory MongoDB fallback:', memErr);
        process.exit(1);
      }
    }
    process.exit(1);
  }
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
    }
    console.log('🛑 MongoDB Disconnected cleanly.');
  } catch (error) {
    console.error('Error during MongoDB disconnect:', error.message);
  }
}

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { DB_URI, NODE_ENV } from '../config/env.js';
import User from '../models/user.model.js';

if (!DB_URI) {
  throw new Error('Please define the DB_URI environment variable inside .env.development.local');
}

let mongoServer;

const connectToDatabase = async () => {
  try {
    console.log(`🔌 Attempting to connect to MongoDB Atlas...`);
    await mongoose.connect(DB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log(`📡 Connected to database in ${NODE_ENV} mode`);
  } catch (error) {
    console.warn(`⚠️ Failed to connect to MongoDB Atlas: ${error.message}`);
    console.log(`🧠 Starting local in-memory MongoDB fallback...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const localUri = mongoServer.getUri();
      
      await mongoose.connect(localUri);
      console.log(`📡 Connected to local in-memory MongoDB database!`);

      // Pre-seed demo user
      const demoEmail = 'demo@subtracker.app';
      const demoPassword = 'Demo@1234';
      const demoName = 'Demo User';

      const existingUser = await User.findOne({ email: demoEmail });
      if (!existingUser) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(demoPassword, salt);
        await User.create({
          name: demoName,
          email: demoEmail,
          password: hashedPassword,
        });
        console.log(`🎉 Demo user auto-created in local DB:`);
        console.log(`   Email: ${demoEmail}`);
        console.log(`   Password: ${demoPassword}`);
      }
    } catch (fallbackError) {
      console.error('❌ Error starting in-memory database:', fallbackError.message);
      process.exit(1);
    }
  }
};

export default connectToDatabase;

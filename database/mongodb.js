import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { NODE_ENV } from '../config/env.js';
import User from '../models/user.model.js';

// Support both DB_URI and MONGODB_URI env var names
const mongoUri = process.env.DB_URI || process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('⚠️  No DB_URI or MONGODB_URI environment variable set. Starting without database — API will be limited.');
}

let mongoServer;

const connectToDatabase = async () => {
  if (mongoUri) {
    try {
      console.log(`🔌 Attempting to connect to MongoDB Atlas...`);
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
      console.log(`📡 Connected to database in ${NODE_ENV} mode`);
      return;
    } catch (error) {
      console.warn(`⚠️ Failed to connect to MongoDB Atlas: ${error.message}`);
    }
  }

  // Fallback: in-memory MongoDB (works when Atlas is unreachable)
  console.log(`🧠 Starting local in-memory MongoDB fallback...`);
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    const localUri = mongoServer.getUri();

    await mongoose.connect(localUri);
    console.log(`📡 Connected to local in-memory MongoDB database!`);

    // Pre-seed demo user so the demo login button works immediately
    const demoEmail    = 'demo@subtracker.app';
    const demoPassword = 'Demo@1234';
    const demoName     = 'Demo User';

    const existingUser = await User.findOne({ email: demoEmail });
    if (!existingUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(demoPassword, salt);
      await User.create({ name: demoName, email: demoEmail, password: hashedPassword });
      console.log(`🎉 Demo user seeded — Email: ${demoEmail} | Password: ${demoPassword}`);
    }
  } catch (fallbackError) {
    console.error('❌ Error starting in-memory database:', fallbackError.message);
    console.error('   The server will run but all database operations will fail.');
    // Don't exit — let the server at least respond to health checks on Render
  }
};

export default connectToDatabase;

import { config } from 'dotenv';

config({ path: `config/.env.${process.env.NODE_ENV || 'development'}.local` });

export const {
  PORT,
  NODE_ENV,
  MONGODB_URI,
  DB_PASSWORD,
} = process.env;
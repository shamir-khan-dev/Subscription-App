import { config } from 'dotenv';

config();

export const { PORT, NODE_ENV, MONGODB_URI } = process.env;
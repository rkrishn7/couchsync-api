import dotenv from 'dotenv';

dotenv.config();

export enum DebugOptions {
  DB_POOL = 'DB_POOL',
}

const {
  PORT,
  STAGE,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_HOST,
  DEBUG,
} = process.env;

export default {
  PORT,
  STAGE,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_HOST,
  DEBUG,
};

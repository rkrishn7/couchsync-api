import dotenv from 'dotenv';

dotenv.config();

const { PORT, STAGE, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;

export default {
  PORT,
  STAGE,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
};

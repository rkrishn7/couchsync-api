import dotenv from 'dotenv';

dotenv.config();

const { PORT, STAGE } = process.env;

export default {
  PORT,
  STAGE,
};

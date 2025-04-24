import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const redis = new Redis(process.env.REDIS_URL!);

export default redis;

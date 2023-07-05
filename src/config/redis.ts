import { Redis } from "ioredis";

export const redisClient: Redis = new Redis({
  host: "localhost",
  port: 6379,
});

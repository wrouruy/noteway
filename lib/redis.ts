import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

export const getRedisClient = async (): Promise<RedisClientType> => {
    if (redisClient?.isOpen)
        return redisClient;

    if (!redisClient) {
        redisClient = createClient({
            url: process.env.REDIS_URL
        });

        redisClient.on('error', (err) => console.error('Redis Client Error:', err));
    }

    if (!redisClient.isOpen)
        await redisClient.connect();

    return redisClient;
};
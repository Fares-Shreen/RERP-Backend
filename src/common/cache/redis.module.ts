import { Global, Module } from "@nestjs/common";
import { createClient } from "redis";

@Global()
@Module({
    providers: [
        {
            provide: "REDIS_CLIENT",
            useFactory: async () => {
                const REDIS_URL = process.env.REDIS_URL;
                const redisClient = await createClient({
                    url: REDIS_URL
                });
                await redisClient.connect();
                redisClient.on('connect', () => console.log('Connected to Redis'));
                redisClient.on('error', (err) => console.error('Redis Client Error', err));
                return redisClient;
            }
        }
    ],
    exports: ["REDIS_CLIENT"],
    imports: [],
    controllers: []
})

export class RedisModule {

}
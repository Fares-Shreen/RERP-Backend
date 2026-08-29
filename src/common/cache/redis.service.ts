import { type RedisClientType } from "redis";
import { Types } from "mongoose";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class redisService {
    constructor(@Inject("REDIS_CLIENT") private readonly redisClient: RedisClientType) {

    }

    revokedKey = ({ userId, jti }: { userId: string, jti: string }) => {
        return `revokeToken::${userId}::${jti}`
    }
    getAllRevokedKeys = ({ userId }: { userId: string }) => {
        return `revokeToken::${userId}::*`
    }

    otpKey = ({ email, subject }: { email: string, subject: string }) => {
        return `otp::${email}::${subject}`
    }

    block_otp_key = ({ email, subject }: { email: string, subject: string }) => {
        return `block_otp::${email}::${subject}`
    }

    max_otp_key = ({ email, subject }: { email: string, subject: string }) => {
        return `max_otp::${email}::${subject}`
    }
    OTAL = ({ token, subject }: { token: string; subject: string }) => {
        return `token::${token}::OTAL::${subject}`;
    };
    setRedis = async ({ key, value, ttl }: { key: string, value: any, ttl?: number }) => {
        try {
            const data = typeof value === "object" ? JSON.stringify(value) : value;
            return ttl
                ? await this.redisClient.set(key, data, { EX: ttl })
                : await this.redisClient.set(key, data);
        } catch (error) {
            console.log("fail to set redis", error);
        }
    };

    update = async ({ key, value, ttl }: { key: string, value: any, ttl?: number }) => {
        try {
            if (!await this.redisClient.exists(key)) {
                return 0;
            }
            const data = typeof value === "object" ? JSON.stringify(value) : value;
            return ttl
                ? await this.redisClient.set(key, data, { EX: ttl })
                : await this.redisClient.set(key, data);
        } catch (error) {
            console.log("fail to update data redis", error);
        }
    };

    getRedis = async (key: string) => {
        try {
            const data: string | null = await this.redisClient.get(key);
            if (!data) return console.log("key not exist");
            ;
            try {
                return JSON.parse(data);
            } catch (error) {
                return data
            } return
        } catch (error) {
            console.log("fail to get redis", error);
        }
    }
    deleteRedis = async (key: string) => {
        try {
            return await this.redisClient.del(key);
        } catch (error) {
            console.log("fail to delete redis", error);
        }
    }
    ttl = async (key: string) => {
        try {
            return await this.redisClient.ttl(key);
        } catch (error) {
            console.log("fail to get ttl redis", error);
        }
    }
    increment = async (key: string) => {
        try {
            return await this.redisClient.incr(key);
        } catch (error) {
            console.log("fail to increment redis", error);
        }
    }


    fcmKey = ({ userId }: { userId: Types.ObjectId }) => {
        return `fcmToken::${userId}`
    }

    async setFcmToken({ userId, fcmToken }: { userId: Types.ObjectId, fcmToken: string }) {
        try {
            return await this.redisClient.sAdd(this.fcmKey({ userId }), fcmToken);
        } catch (error) {
            console.log("fail to set fcm token", error);
        }
    }
    async getFcmToken({ userId }: { userId: Types.ObjectId }) {
        try {
            return await this.redisClient.sMembers(this.fcmKey({ userId }));
        } catch (error) {
            console.log("fail to get fcm token", error);
        }
    }

    async deleteFcmToken({ userId, fcmToken }: { userId: Types.ObjectId, fcmToken: string }) {
        try {
            return await this.redisClient.sRem(this.fcmKey({ userId }), fcmToken);
        } catch (error) {
            console.log("fail to delete fcm token", error);
        }
    }

    async deleteAllFcmToken({ userId }: { userId: Types.ObjectId }) {
        try {
            return await this.redisClient.del(this.fcmKey({ userId }));
        } catch (error) {
            console.log("fail to delete all fcm token", error);
        }
    }

    async hasFcmToken({ userId, fcmToken }: { userId: Types.ObjectId, fcmToken: string }) {
        try {
            return await this.redisClient.sCard(this.fcmKey({ userId }));
        } catch (error) {
            console.log("fail to check fcm token", error);
        }
    }




}

export default redisService
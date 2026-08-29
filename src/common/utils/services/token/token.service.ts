import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from "@nestjs/jwt";
import { JwtPayload } from "jsonwebtoken";
import redisService from 'src/common/cache/redis.service';
import { EmployeeRepository } from 'src/DB/repositories/employee.repository';
// import { UserRepository } from 'src/DB/repositories/user.repository'; // You will import this later!

@Injectable()
export class TokenService {
    constructor(
        private jwtService: JwtService,
        private employeeRepository: EmployeeRepository,
        private _redisService: redisService,
        // private userRepository: UserRepository <-- You will inject this later for customers
    ) { }

    GenerateToken = ({ payload, options }: { payload: object, options: JwtSignOptions }): Promise<string> => {
        return this.jwtService.signAsync(payload, options);
    }

    VerifyToken = ({ token, options }: { token: string, options: JwtVerifyOptions }): Promise<JwtPayload> => {
        return this.jwtService.verifyAsync(token, options);
    }

    accessSignature = async (prefix: string) => {
        let ACCESS_SECRET_KEY = "";
        let REFRESH_SECRET_KEY = "";

        if (prefix === process.env.USER) {
            ACCESS_SECRET_KEY = process.env.ACCESS_TOKEN_ACCESS_USER!;
            REFRESH_SECRET_KEY = process.env.REFRESH_TOKEN_ACCESS_USER!;
        } else if (prefix === process.env.ADMIN) {
            ACCESS_SECRET_KEY = process.env.ACCESS_TOKEN_ACCESS_ADMIN!;
            REFRESH_SECRET_KEY = process.env.REFRESH_TOKEN_ACCESS_ADMIN!;
        } else {
            throw new UnauthorizedException("Invalid authentication prefix");
        }

        return { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY };
    }

    decodeToken_fetch = async (token: string, secret: string, prefix: string) => {
        const decoded = await this.VerifyToken({ token, options: { secret } });

        if (!decoded || !decoded.id) {
            throw new UnauthorizedException("Invalid token payload");
        }

        let userDoc;
        let userType;

        // DUAL-AUTH ROUTING:
        if (prefix === process.env.ADMIN) {
            userDoc = await this.employeeRepository.findById(decoded.id);
            userType = 'employee';
        } else if (prefix === process.env.USER) {
            // userDoc = await this.userRepository.findById(decoded.id); <-- Ready for e-commerce!
            userType = 'customer';
        }

        if (!userDoc) {
            throw new UnauthorizedException("Account not found");
        }
        const isRevoked = await this._redisService.getRedis(
            this._redisService.revokedKey({ userId: userDoc._id.toString(), jti: decoded.jti as string })
        );

        if (isRevoked) {
            throw new UnauthorizedException("Session has been terminated. Please login again.");
        }

        // Security Check: Token IAT vs Password Change Date
        if (userDoc.changeCredentialAt?.getTime() > (decoded.iat as number) * 1000) {
            throw new UnauthorizedException("Password changed recently. Please login again.");
        }

        return { user: userDoc, decoded, userType };
    }
}
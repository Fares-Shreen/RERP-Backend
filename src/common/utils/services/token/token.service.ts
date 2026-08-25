import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from "@nestjs/jwt";
import { JwtPayload } from "jsonwebtoken";
@Injectable()
export class TokenService {
    constructor(private jwtService : JwtService) {}

    GenerateToken = ({ payload, options }: { payload: object, options: JwtSignOptions }): Promise<string> => {
        return this.jwtService.signAsync(payload, options);
    }

    VerifyToken = ({ token, options }: { token: string, options: JwtVerifyOptions }): Promise<JwtPayload> => {
        return this.jwtService.verifyAsync(token, options);
    }

    accessSignature = async (prefix: string) => {
        let ACCESS_SECRET_KEY = "";
        let REFRESH_SECRET_KEY = ""
        if (prefix === process.env.USER) {
            ACCESS_SECRET_KEY = process.env.ACCESS_TOKEN_ACCESS_USER!;
            REFRESH_SECRET_KEY = process.env.REFRESH_TOKEN_ACCESS_USER!
        } else if (prefix === process.env.ADMIN) {
            ACCESS_SECRET_KEY = process.env.ACCESS_TOKEN_ACCESS_ADMIN!;
            REFRESH_SECRET_KEY = process.env.REFRESH_TOKEN_ACCESS_ADMIN!
        }
        else {
            throw new Error("Invalid token type");
        }
        return { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY }
    }

    decodeToken_fetchUser = async (token: string, secret: string) => {
        const decoded = await this.VerifyToken({ token, options: { secret } })

        if (!decoded) {
            throw new Error("Invalid token");
        }
        console.log(decoded);

        const user = 2
        // await this.userRepo.findById(decoded.userId as any);
        console.log(user);

        if (!user) {
            throw new Error("User not found");
        }
        const jwtIat = decoded.iat as number;
        // if (user.changeCredentials.getTime() > jwtIat * 1000) {
        //     throw new Error("you need to login again");
        // }

        // if (!user.confirmed) {
        //     throw new Error("User not confirmed");
        // }
        return { user, decoded }
    }

}

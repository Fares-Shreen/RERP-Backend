import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import redisService from 'src/common/cache/redis.service';
import { emailEnum } from 'src/common/enums/redis.enum';
import { Compare_Function, Hash_Function } from 'src/common/utils/security/hashing/hash.security';
import { email_event_name, eventEmitter } from 'src/common/utils/security/nodemailer/email.event';
import emailTemplate from 'src/common/utils/security/nodemailer/emailTemplete';
import { generateOTP, sendEmail } from 'src/common/utils/security/nodemailer/sendEmail';
import { TokenService } from 'src/common/utils/services/token/token.service';
import { EmployeeRepository } from 'src/DB/repositories/employee.repository';

@Injectable()
export class AuthService {
    constructor(
        private readonly _tokenService: TokenService,
        private readonly _redisService: redisService,
        private readonly _employeeRepository: EmployeeRepository
    ) { }


    //base Auth methods

    async sendEmailOTP({ email, subject }: { email: string, subject: string }) {
        const bloackedOtp = await this._redisService.ttl(this._redisService.block_otp_key({ email, subject }));
        if (bloackedOtp && bloackedOtp > 0) {
            throw new Error(
                `you reached the limit of sending otp, you can resend after ${bloackedOtp} seconds`,
                { cause: 400 },
            );
        }
        const otpTtl = await this._redisService.ttl(this._redisService.otpKey({ email, subject }));
        if (otpTtl && otpTtl > 0) {
            throw new Error(`you can resend otp after ${otpTtl} seconds`, {
                cause: 400,
            });
        }
        const maxOtpsend = await this._redisService.getRedis(this._redisService.max_otp_key({ email, subject }));
        if (maxOtpsend >= 3) {
            await this._redisService.setRedis({
                key: this._redisService.block_otp_key({ email, subject }),
                value: 1,
                ttl: 60,
            });
            await this._redisService.deleteRedis(this._redisService.max_otp_key({ email, subject }));
            throw new Error(
                `you reached the limit of sending otp, you can resend after ${bloackedOtp} seconds`,
                {
                    cause: 400,
                },
            );
        }

        const otp = generateOTP();
        eventEmitter.emit(email_event_name, async () => {
            await sendEmail({
                to: email,
                subject: "OTP",
                html: `<h1>OTP:${otp}</h1>`,
            });
        });
        const otpHashed = Hash_Function({ plainText: otp.toString(), saltRounds: 12 });
        await this._redisService.setRedis({
            key: this._redisService.otpKey({ email, subject }),
            value: otpHashed,
            ttl: 60 * 2,
        });
        await this._redisService.increment(this._redisService.max_otp_key({ email, subject }));
    };

    // Employee Auth methods     

    async employeelogin(email: string, password: string) {
        const employee = await this._employeeRepository.findOne({ filter: { email: email } });
        if (!employee) {
            throw new NotFoundException('Invalid email or password.');
        }
        const isPasswordMatch = Compare_Function({ plainText: password, cipherText: employee.password });
        if (!isPasswordMatch) {
            throw new BadRequestException('Invalid email or password.');
        }
        // const OTP = generateOTP()
        // eventEmitter.emit(email_event_name, async () => {
        //     await sendEmail({
        //         to: email,
        //         subject: 'Your OTP Code',
        //         html: emailTemplate(employee.name, OTP.toString()),
        //     });
        // });

        // const hashedOTP = Hash_Function({ plainText: OTP.toString() });

        // await this._redisService.setRedis({
        //     key: this._redisService.otpKey({ email, subject: emailEnum.loginOTP }),
        //     value: hashedOTP,
        //     ttl: 300, // 5 minutes
        // })
        // await this._redisService.setRedis({
        //     key: this._redisService.max_otp_key({ email, subject: emailEnum.loginOTP }),
        //     value: 1,
        //     ttl: 300,
        // })
        const accessTokenId = randomUUID();
        const refreshTokenId = randomUUID();
        const accessToken = await this._tokenService.GenerateToken({
            payload: { id: employee._id, role: employee.role, email: employee.email, jti: accessTokenId },
            options: { expiresIn: '1D', secret: process.env.ACCESS_TOKEN_ACCESS_EMPLOYEE },
        });
        const refreshToken = await this._tokenService.GenerateToken({
            payload: { id: employee._id, role: employee.role, email: employee.email, jti: refreshTokenId },
            options: { expiresIn: '7D', secret: process.env.REFRESH_TOKEN_ACCESS_EMPLOYEE },
        });
        await this._redisService.deleteRedis(
            this._redisService.otpKey({ email, subject: emailEnum.loginOTP })
        );
        return {
            accessToken,
            refreshToken
        };
    }

    async employeeVerifyLoginOTP(email: string, otp: string) {
        const hashedOTP = await this._redisService.getRedis(
            this._redisService.otpKey({ email, subject: emailEnum.loginOTP })
        )
        if (!hashedOTP) {
            throw new BadRequestException('OTP has expired or is invalid.');
        }
        const isOTPValid = Compare_Function({ plainText: otp, cipherText: hashedOTP });
        if (!isOTPValid) {
            throw new BadRequestException('OTP is invalid.');
        }
        const employee = await this._employeeRepository.findOne({ filter: { email: email } });
        if (!employee) {
            throw new NotFoundException('Employee not found.');
        }
        const accessTokenId = randomUUID();
        const refreshTokenId = randomUUID();
        const accessToken = await this._tokenService.GenerateToken({
            payload: { id: employee._id, role: employee.role, email: employee.email, jti: accessTokenId },
            options: { expiresIn: '1D', secret: process.env.ACCESS_TOKEN_ACCESS_EMPLOYEE },
        });
        const refreshToken = await this._tokenService.GenerateToken({
            payload: { id: employee._id, role: employee.role, email: employee.email, jti: refreshTokenId },
            options: { expiresIn: '7D', secret: process.env.REFRESH_TOKEN_ACCESS_EMPLOYEE },
        });
        await this._redisService.deleteRedis(
            this._redisService.otpKey({ email, subject: emailEnum.loginOTP })
        );
        return {
            accessToken,
            refreshToken
        };
    }

    async resendEmployeeLoginOTP(email: string) {
        const employee = await this._employeeRepository.findOne({ filter: { email: email } });
        if (!employee) {
            throw new NotFoundException('Employee not found.');
        }
        await this.sendEmailOTP({ email, subject: emailEnum.loginOTP });
        return {
            message: 'OTP resent successfully'
        }
    }

    async refreshEmployeeToken(refreshToken: string) {
        const payload = await this._tokenService.VerifyToken({ token: refreshToken, options: { secret: process.env.REFRESH_TOKEN_ACCESS_EMPLOYEE } });
        if (!payload) {
            throw new UnauthorizedException('Invalid refresh token.');
        }
        const employee = await this._employeeRepository.findOne({ filter: { email: payload.email } });
        if (!employee) {
            throw new NotFoundException('Employee not found.');
        }
        const accessTokenId = randomUUID();
        const accessToken = await this._tokenService.GenerateToken({
            payload: { id: employee._id, role: employee.role, email: employee.email, jti: accessTokenId },
            options: { expiresIn: '1D', secret: process.env.ACCESS_TOKEN_ACCESS_EMPLOYEE },
        });
        return {
            accessToken
        };
    }

    async employeeForgotPassword(email: string) {
        const employee = await this._employeeRepository.findOne({ filter: { email: email } });
        if (!employee) {
            throw new NotFoundException('Employee not found.');
        }
        await this.sendEmailOTP({ email, subject: emailEnum.forgetPassword });
        return {
            message: 'If an account exists, a password reset OTP has been sent.'
        };
    }

    async employeeResetPassword(email: string, code: string, newPassword: string) {
        const hashedOTP = await this._redisService.getRedis(
            this._redisService.otpKey({ email, subject: emailEnum.forgetPassword })
        );

        if (!hashedOTP) {
            throw new BadRequestException('Reset OTP has expired or is invalid.');
        }

        const isOTPValid = Compare_Function({ plainText: code, cipherText: hashedOTP });
        if (!isOTPValid) {
            throw new BadRequestException('Reset OTP is invalid.');
        }

        const hashedNewPassword = Hash_Function({ plainText: newPassword });

        await this._employeeRepository.findOneAndUpdate(
            {
                filter: { email: email },
                update: {
                    $set: {
                        password: hashedNewPassword,
                        changeCredentialAt: new Date()
                    }
                }
            }
        );

        await this._redisService.deleteRedis(
            this._redisService.otpKey({ email, subject: emailEnum.forgetPassword })
        );

        return {
            message: 'Password reset successfully'
        };
    }

    async employeeLogout(userId: string, jti: string, exp: number, flag?: string) {
        if (flag === 'All') {
            await this._employeeRepository.findOneAndUpdate(
                {
                    filter: { _id: userId },
                    update: { $set: { changeCredentials: new Date() } }
                }
            );
            console.log('All tokens for user ' + userId + ' have been revoked.');
            const keys = await this._redisService.getRedis(
                this._redisService.getAllRevokedKeys({ userId: userId }),
            );
            console.log(keys);

            if (keys.length > 0) {
                await this._redisService.deleteRedis(keys);
            }
        } else {
            const currentTime = Math.floor(Date.now() / 1000);
            const remainingTtl = exp - currentTime;

            if (remainingTtl > 0) {
                await this._redisService.setRedis({
                    key: this._redisService.revokedKey({ userId, jti }),
                    value: jti,
                    ttl: remainingTtl,
                });
            }
        }

        return {
            message: 'Logged out successfully'
        };
    }



}

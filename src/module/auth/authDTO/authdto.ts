import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsOptional } from 'class-validator';

export class LoginDto {
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

export class VerifyOtpDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    code: string;
}


export class EmailDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}

export class RefreshTokenDto {
    @IsString()
    @IsNotEmpty({ message: 'Refresh token is required' })
    refreshToken: string;
}

export class ResetPasswordDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Password must contain uppercase, lowercase, and numbers/special characters',
    })
    newPassword: string;
}

export class LogoutDto {

    @IsOptional()
    @IsString()
    flag?: string;
}
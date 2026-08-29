import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, VerifyOtpDto, EmailDto, RefreshTokenDto, ResetPasswordDto, LogoutDto } from './authDTO/authdto';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { Employee } from 'src/common/decorators/employee/employee.decorator';
import {Roles, tokenTypeDecorator } from 'src/common/decorators/auth/auth.decorator';
import { tokenEnum } from 'src/common/enums/token.enum';
import { employee_role_Enum } from 'src/common/enums/employee.enum';

@Controller('auth/employee')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.employeelogin(loginDto.email, loginDto.password);
  }

  @Post('verify-otp')
  verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.employeeVerifyLoginOTP(verifyOtpDto.email, verifyOtpDto.code);
  }

  @Post('resend-otp')
  resendOtp(@Body() emailDto: EmailDto) {
    return this.authService.resendEmployeeLoginOTP(emailDto.email);
  }

  @Post('forgot-password')
  forgotPassword(@Body() emailDto: EmailDto) {
    return this.authService.employeeForgotPassword(emailDto.email);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.employeeResetPassword(
      resetPasswordDto.email,
      resetPasswordDto.code,
      resetPasswordDto.newPassword
    );
  }

  @Post('refresh-token')
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshEmployeeToken(refreshTokenDto.refreshToken);
  }
  @tokenTypeDecorator(tokenEnum.accessToken)
  // @Roles([employee_role_Enum.])
  @UseGuards(AuthenticationGuard)
  @Post('logout')
  logout(
    @Body() logoutDto: LogoutDto,
    @Req() req: any, 
    @Employee('_id') userId: string
  ) {
    return this.authService.employeeLogout(
      userId,
      req.decoded.jti,
      req.decoded.exp,
      logoutDto.flag
    );
  }
}
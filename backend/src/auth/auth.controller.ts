import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  async sendOtp(@Body('mobile') mobile: string) {
    return this.authService.sendOtp(mobile);
  }

  @Post('verify-otp')
  async verifyOtp(@Body('mobile') mobile: string, @Body('otp') otp: string) {
    return this.authService.verifyOtp(mobile, otp);
  }
}

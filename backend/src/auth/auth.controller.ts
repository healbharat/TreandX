import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.authService.login(body);
  }

  @Post('firebase')
  async verifyFirebase(@Body('idToken') idToken: string) {
    return this.authService.verifyFirebase(idToken);
  }

  @Post('send-otp')
  async sendOtp(@Body('mobile') mobile: string) {
    return this.authService.sendOtp(mobile);
  }

  @Post('verify-otp')
  async verifyOtp(@Body('mobile') mobile: string, @Body('otp') otp: string) {
    return this.authService.verifyOtp(mobile, otp);
  }
}

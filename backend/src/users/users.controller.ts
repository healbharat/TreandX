import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.usersService.findOne(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('setup-profile')
  async setupProfile(
    @Request() req,
    @Body() profileData: { name: string; username: string; profileImage?: string },
  ) {
    return this.usersService.setupProfile(req.user.userId, profileData);
  }
}

import { Controller, Get, Post, Body, UseGuards, Request, Param, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':username')
  async getByUsername(@Param('username') username: string, @Request() req) {
    const user = await this.usersService.findByUsername(username);
    if (req.user?.userId) {
       await this.usersService.trackProfileView(user._id.toString(), req.user.userId);
    }
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('analytics/summary')
  async getAnalytics(@Request() req) {
    return this.usersService.getCreatorAnalytics(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update')
  async updateProfile(@Request() req, @Body() data: any) {
    return this.usersService.updateProfile(req.user.userId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/me')
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

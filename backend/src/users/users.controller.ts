import { Controller, Get, Post, Body, UseGuards, Request, Param, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':username')
  async getByUsername(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
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

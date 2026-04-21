import { Controller, Post, Get, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('follow')
@UseGuards(JwtAuthGuard)
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(':userId')
  async followUser(@Param('userId') userId: string, @Req() req) {
    return this.followsService.toggleFollow(userId, req.user.userId);
  }

  @Patch('request/:id')
  async handleRequest(@Param('id') id: string, @Body() body: { action: 'accept' | 'reject' }) {
    return this.followsService.handleRequest(id, body.action);
  }

  @Get(':userId/followers')
  async getFollowers(@Param('userId') userId: string) {
    return this.followsService.getFollowers(userId);
  }

  @Get(':userId/following')
  async getFollowing(@Param('userId') userId: string) {
    return this.followsService.getFollowing(userId);
  }

  @Get('suggestions')
  async suggestions(@Req() req) {
    return this.followsService.getSuggestions(req.user.userId);
  }

  @Get('mutual/:userId')
  async mutual(@Param('userId') userId: string, @Req() req) {
    return this.followsService.getMutualConnections(userId, req.user.userId);
  }

  @Get('requests')
  async getRequests(@Req() req) {
    return this.followsService.getPendingRequests(req.user.userId);
  }
}

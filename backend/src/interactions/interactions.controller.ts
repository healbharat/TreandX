import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { InteractionsService } from './interactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('interactions')
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('comment')
  async addComment(@Body() data: { postId: string, content: string }, @Request() req) {
    return this.interactionsService.addComment(req.user.userId, data.postId, data.content);
  }

  @Get('comments')
  async getComments(@Query('postId') postId: string) {
    return this.interactionsService.getComments(postId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('follow/toggle')
  async toggleFollow(@Body('targetUserId') targetUserId: string, @Request() req) {
    return this.interactionsService.toggleFollow(req.user.userId, targetUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('follow/status')
  async getFollowStatus(@Query('targetUserId') targetUserId: string, @Request() req) {
    return this.interactionsService.getFollowStatus(req.user.userId, targetUserId);
  }
}

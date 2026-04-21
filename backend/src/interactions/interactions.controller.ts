import { Controller, Get, Post, Patch, Body, Query, UseGuards, Request, Param } from '@nestjs/common';
import { InteractionsService } from './interactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('interactions')
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('comment')
  async addComment(@Body() data: { postId: string; text: string; parentId?: string }, @Request() req) {
    return this.interactionsService.addComment(req.user.userId, data.postId, data.text, data.parentId);
  }

  @Get('comments')
  async getComments(@Query('postId') postId: string, @Request() req) {
    const userId = req.user?.userId;
    return this.interactionsService.getComments(postId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('comment/like/:commentId')
  async toggleCommentLike(@Param('commentId') commentId: string, @Request() req) {
    return this.interactionsService.toggleCommentLike(commentId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('comment/pin/:commentId')
  async pinComment(@Param('commentId') commentId: string, @Request() req) {
    return this.interactionsService.pinComment(commentId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('comment/hide/:commentId')
  async hideComment(@Param('commentId') commentId: string, @Request() req) {
    return this.interactionsService.hideComment(commentId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('like/toggle')
  async toggleLike(@Body('postId') postId: string, @Request() req) {
    return this.interactionsService.toggleLike(postId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('save/toggle')
  async toggleSave(@Body('postId') postId: string, @Request() req) {
    return this.interactionsService.toggleSave(postId, req.user.userId);
  }

  @Post('share')
  async sharePost(@Body('postId') postId: string) {
    return this.interactionsService.sharePost(postId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('saved-posts')
  async getSavedPosts(@Request() req) {
    return this.interactionsService.getSavedPosts(req.user.userId);
  }
}

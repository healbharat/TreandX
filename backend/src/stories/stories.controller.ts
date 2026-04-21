import { Controller, Post, Get, Body, Param, UseGuards, Req, Delete, Patch } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Post()
  async createStory(@Req() req, @Body() body: any) {
    return this.storiesService.createStory(req.user.userId, body);
  }

  @Get('following')
  async getFollowingStories(@Req() req) {
    return this.storiesService.getFollowingStories(req.user.userId);
  }

  @Post(':id/view')
  async trackView(@Req() req, @Param('id') id: string) {
    return this.storiesService.trackView(id, req.user.userId);
  }

  @Post(':id/react')
  async addReaction(@Req() req, @Param('id') id: string, @Body('type') type: string) {
    return this.storiesService.addReaction(id, req.user.userId, type);
  }

  @Delete(':id')
  async deleteStory(@Req() req, @Param('id') id: string) {
    return this.storiesService.deleteStory(id, req.user.userId);
  }

  @Patch(':id/highlight')
  async toggleHighlight(@Req() req, @Param('id') storyId: string) {
    return this.storiesService.toggleHighlight(storyId, req.user.userId);
  }

  @Get('user/:userId/highlights')
  async getHighlights(@Param('userId') userId: string) {
    return this.storiesService.getHighlights(userId);
  }
}

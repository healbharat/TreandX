import { Controller, Post, Get, Body, UseGuards, Req, Query } from '@nestjs/common';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('summarize')
  async summarize(@Body('content') content: string) {
    if (!content) return { summary: '' };
    const summary = await this.aiService.summarize(content);
    return { summary };
  }

  @Post('headline')
  async generateHeadline(@Body('content') content: string) {
    if (!content) return { headline: '' };
    const headline = await this.aiService.generateHeadline(content);
    return { headline };
  }

  @UseGuards(JwtAuthGuard)
  @Get('recommendations')
  async getRecommendations(@Req() req) {
    const userId = req.user.userId;
    return this.aiService.getRecommendations(userId);
  }
}

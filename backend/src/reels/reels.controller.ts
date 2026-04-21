import { Controller, Get, Post, Body, Query, UseGuards, Request, UseInterceptors, UploadedFile, Param, Patch } from '@nestjs/common';
import { ReelsService } from './reels.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('reels')
export class ReelsController {
  constructor(private readonly reelsService: ReelsService) {}

  @Get()
  async getReels(@Query('page') page: number = 1, @Request() req) {
    const userId = req.user?.userId;
    return this.reelsService.getReels(Number(page), 5, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('video'))
  async uploadReel(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { caption?: string; audioId?: string },
    @Request() req,
  ) {
    return this.reelsService.uploadReel(req.user.userId, file, body.caption, body.audioId);
  }

  @Get('audio')
  async getAudios() {
    return this.reelsService.getAudios();
  }

  @UseGuards(JwtAuthGuard)
  @Post('remix/:id')
  async remixReel(@Param('id') id: string, @Body('caption') caption: string, @Request() req) {
    return this.reelsService.remixReel(req.user.userId, id, caption);
  }

  @Patch(':id/view')
  async trackView(@Param('id') id: string) {
    return this.reelsService.incrementView(id);
  }
}

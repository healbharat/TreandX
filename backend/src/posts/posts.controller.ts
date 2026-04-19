import { Controller, Get, Post, Body, Query, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller()
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly uploadService: UploadService,
  ) {}

  @Get('feed')
  async getFeed(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Request() req,
  ) {
    const userId = req.user?.userId;
    return this.postsService.getFeed(Number(page), Number(limit), userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('post/create')
  async createPost(
    @Body() postData: { content: string; category: string; imageUrl?: string; headline?: string },
    @Request() req,
  ) {
    return this.postsService.createPost(
      req.user.userId,
      postData.content,
      postData.category,
      postData.imageUrl,
      postData.headline,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload/image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@UploadedFile() file: any) {
    const url = await this.uploadService.uploadImage(file);
    return { url };
  }

  @UseGuards(JwtAuthGuard)
  @Post('post/like')
  async toggleLike(@Body('postId') postId: string, @Request() req) {
    return this.postsService.toggleLike(postId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('post/save')
  async toggleSave(@Body('postId') postId: string, @Request() req) {
    return this.postsService.toggleSave(postId, req.user.userId);
  }
}

import { Controller, Get, Post, Body, Query, UseGuards, Request, UseInterceptors, UploadedFile, Param, Delete } from '@nestjs/common';
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
  @Get('user/:id/posts')
  async getUserPosts(@Param('id') userId: string) {
    return this.postsService.getUserPosts(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('post/:id')
  async deletePost(@Param('id') postId: string, @Request() req) {
    return this.postsService.deletePost(postId, req.user.userId);
  }
}

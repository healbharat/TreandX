import { Controller, Get, Post, Patch, Delete, Body, Query, UseGuards, Request, UseInterceptors, UploadedFiles, Param } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

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
  @Get('suggested')
  async getSuggested(@Request() req) {
    return this.postsService.getSuggestedPosts(req.user.userId);
  }

  @Get(':id')
  async getPost(@Param('id') id: string, @Request() req) {
    const userId = req.user?.userId;
    return this.postsService.getPostById(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('files', 10))
  async createPost(@UploadedFiles() files: any[], @Body() body: any, @Request() req) {
    return this.postsService.createPost(req.user.userId, body, files);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updatePost(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.postsService.updatePost(id, req.user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePost(@Param('id') id: string, @Request() req) {
    return this.postsService.deletePost(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:id')
  async getUserPosts(@Param('id') userId: string) {
    return this.postsService.getUserPosts(userId);
  }
}

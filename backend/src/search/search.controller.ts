import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(@Query('q') query: string) {
    if (!query) return { users: [], posts: [] };
    return this.searchService.searchAll(query);
  }

  @Get('users')
  async searchUsers(@Query('q') query: string) {
    if (!query) return [];
    return this.searchService.searchUsers(query);
  }

  @Get('posts')
  async searchPosts(@Query('q') query: string) {
    if (!query) return [];
    return this.searchService.searchPosts(query);
  }

  @Get('trending')
  async getTrending() {
    return this.searchService.getTrending();
  }
}

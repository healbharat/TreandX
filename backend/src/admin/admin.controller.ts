import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  async getUsers() {
    return this.adminService.getAllUsers();
  }

  @Patch('user/:id/toggle-block')
  async toggleBlock(@Param('id') id: string) {
    return this.adminService.toggleUserBlock(id);
  }

  @Get('posts')
  async getPosts() {
    return this.adminService.getAllPosts();
  }

  @Patch('post/:id/block')
  async blockPost(@Param('id') id: string) {
    return this.adminService.blockPost(id);
  }

  @Get('reports')
  async getReports() {
    return this.adminService.getAllReports();
  }

  @Patch('report/:id/resolve')
  async resolveReport(@Param('id') id: string) {
    return this.adminService.resolveReport(id);
  }
}

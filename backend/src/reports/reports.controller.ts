import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('report')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async reportPost(@Req() req, @Body() body: { postId: string; reason: string }) {
    return this.reportsService.createReport(req.user.userId, body.postId, body.reason);
  }
}

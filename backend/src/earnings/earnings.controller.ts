import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { EarningsService } from './earnings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('earnings')
export class EarningsController {
  constructor(private readonly earningsService: EarningsService) {}

  @Get()
  async getEarnings(@Req() req) {
    return this.earningsService.getEarnings(req.user.userId);
  }

  @Post('withdraw')
  async withdraw(@Req() req, @Body('amount') amount: number) {
    return this.earningsService.withdrawEarnings(req.user.userId, amount);
  }
}

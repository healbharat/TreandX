import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order')
  async createOrder(@Req() req, @Body('amount') amount: number) {
    return this.paymentsService.createOrder(req.user.userId, amount);
  }

  @Post('verify')
  async verifyPayment(@Req() req, @Body() data: { orderId: string; paymentId: string; signature: string }) {
    return this.paymentsService.verifyPayment(req.user.userId, data);
  }
}

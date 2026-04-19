import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
const Razorpay = require('razorpay');
import * as crypto from 'crypto';
import { Transaction } from './schemas/transaction.schema';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class PaymentsService {
  private razorpay: any;

  constructor(
    private configService: ConfigService,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get('RAZORPAY_KEY_SECRET'),
    });
  }

  async createOrder(userId: string, amount: number) {
    const options = {
      amount: amount * 100, // in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    try {
      const order = await this.razorpay.orders.create(options);
      
      await this.transactionModel.create({
        userId: new Types.ObjectId(userId),
        orderId: order.id,
        amount,
      });

      return order;
    } catch (err) {
      console.error('[PAYMENT] Order creation failed:', err);
      throw new BadRequestException('Failed to create payment order');
    }
  }

  async verifyPayment(userId: string, data: { orderId: string; paymentId: string; signature: string }) {
    const { orderId, paymentId, signature } = data;
    const secret = this.configService.get('RAZORPAY_KEY_SECRET');

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(orderId + '|' + paymentId);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== signature) {
      throw new BadRequestException('Invalid payment signature');
    }

    // Update Transaction
    await this.transactionModel.findOneAndUpdate(
      { orderId },
      { paymentId, status: 'success' },
    );

    // Update User Premium Status
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1); // 1 year premium

    await this.userModel.findByIdAndUpdate(userId, {
      isPremium: true,
      premiumExpiry: expiry,
    });

    return { message: 'Payment verified successfully and premium activated' };
  }
}

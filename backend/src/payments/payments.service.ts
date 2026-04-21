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
    const keyId = this.configService.get('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');

    if (keyId && keySecret) {
      this.razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      console.log('[PAYMENT] Razorpay initialized successfully');
    } else {
      console.warn('[PAYMENT] Razorpay keys missing. Payment features will be disabled.');
      this.razorpay = null;
    }
  }

  async createOrder(userId: string, amount: number) {
    if (!this.razorpay) {
      throw new BadRequestException('Payment system is not configured yet');
    }
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
    if (!this.razorpay) {
      throw new BadRequestException('Payment system is not configured yet');
    }
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

import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationType } from './schemas/notification.schema';
import { EventsGateway } from '../events/events.gateway';
import * as admin from 'firebase-admin';
import { User } from '../users/schemas/user.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationsService implements OnModuleInit {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly eventsGateway: EventsGateway,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    try {
      const projectId = this.configService.get('FIREBASE_PROJECT_ID');
      const clientEmail = this.configService.get('FIREBASE_CLIENT_EMAIL');
      const privateKey = this.configService.get('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n');

      if (projectId && clientEmail && privateKey) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
        console.log('[FCM] Firebase Admin Initialized Successfully');
      } else if (process.env.FIREBASE_CONFIG) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log('[FCM] Firebase Admin Initialized from FIREBASE_CONFIG');
      }
    } catch (err) {
      console.warn('[FCM] Firebase Initialization failed:', err.message);
    }
  }

  async saveToken(userId: string, fcmToken: string) {
    return this.userModel.findByIdAndUpdate(userId, { fcmToken });
  }

  async create(data: {
    userId: string;
    senderId: string;
    type: NotificationType;
    message: string;
    postId?: string;
  }) {
    if (data.userId === data.senderId) return;

    const notification = await this.notificationModel.create({
      userId: new Types.ObjectId(data.userId),
      senderId: new Types.ObjectId(data.senderId),
      type: data.type,
      message: data.message,
      postId: data.postId ? new Types.ObjectId(data.postId) : undefined,
    });

    const populated = await notification.populate('senderId', 'name username profileImage');

    // 1. Emit Real-time via WebSocket
    this.eventsGateway.server.to(data.userId).emit('new-notification', populated);
    // Note: To make this work, we need to join users to their own room in the gateway

    // 2. Send Push Notification via FCM
    const receiver = await this.userModel.findById(data.userId) as any;
    if (receiver?.fcmToken) {
      this.sendPushNotification(receiver.fcmToken, data.message);
    }

    return populated;
  }

  private async sendPushNotification(token: string, message: string) {
    try {
      const payload = {
        notification: {
          title: 'TreandX',
          body: message,
        },
        token: token,
      };
      await admin.messaging().send(payload);
    } catch (err) {
      console.error('[FCM] Failed to send push', err);
    }
  }

  async findAll(userId: string) {
    return this.notificationModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('senderId', 'name username profileImage')
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }

  async markAsRead(notificationId: string) {
    return this.notificationModel.findByIdAndUpdate(notificationId, { isRead: true }, { returnDocument: 'after' });
  }

  async markAllAsRead(userId: string) {
    return this.notificationModel.updateMany({ userId: new Types.ObjectId(userId) }, { isRead: true });
  }

  async getUnreadCount(userId: string) {
    return this.notificationModel.countDocuments({ userId: new Types.ObjectId(userId), isRead: false });
  }
}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { InteractionsModule } from './interactions/interactions.module';
import { EventsModule } from './events/events.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SearchModule } from './search/search.module';
import { AIModule } from './ai/ai.module';
import { AdminModule } from './admin/admin.module';
import { ReportsModule } from './reports/reports.module';
import { PaymentsModule } from './payments/payments.module';
import { AdsModule } from './ads/ads.module';
import { EarningsModule } from './earnings/earnings.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CommonModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        if (!uri) {
          throw new Error('MONGODB_URI is not defined in environment variables');
        }
        return { uri };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    PostsModule,
    InteractionsModule,
    EventsModule,
    NotificationsModule,
    SearchModule,
    AIModule,
    AdminModule,
    ReportsModule,
    PaymentsModule,
    AdsModule,
    EarningsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post, PostSchema } from './schemas/post.schema';
import { Like, LikeSchema } from './schemas/like.schema';
import { Save, SaveSchema } from './schemas/save.schema';
import { RedisService } from '../common/redis.service';
import { UploadService } from './upload.service';
import { EventsModule } from '../events/events.module';
import { Follow, FollowSchema } from '../interactions/schemas/follow.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { EarningsModule } from '../earnings/earnings.module';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    EventsModule,
    NotificationsModule,
    EarningsModule,
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Save.name, schema: SaveSchema },
      { name: Follow.name, schema: FollowSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [PostsService, UploadService],
  controllers: [PostsController],
  exports: [MongooseModule, UploadService],
})
export class PostsModule {}

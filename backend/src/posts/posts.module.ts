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

@Module({
  imports: [
    EventsModule,
    NotificationsModule,
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Save.name, schema: SaveSchema },
      { name: Follow.name, schema: FollowSchema },
    ]),
  ],
  providers: [PostsService, RedisService, UploadService],
  controllers: [PostsController],
})
export class PostsModule {}

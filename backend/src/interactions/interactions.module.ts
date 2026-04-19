import { Module } from '@nestjs/common';
import { InteractionsService } from './interactions.service';
import { InteractionsController } from './interactions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { Follow, FollowSchema } from './schemas/follow.schema';
import { Post, PostSchema } from '../posts/schemas/post.schema';
import { Like, LikeSchema } from '../posts/schemas/like.schema';
import { EventsModule } from '../events/events.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    EventsModule,
    NotificationsModule,
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Follow.name, schema: FollowSchema },
      { name: Post.name, schema: PostSchema },
      { name: Like.name, schema: LikeSchema },
    ]),
  ],
  providers: [InteractionsService],
  controllers: [InteractionsController],
})
export class InteractionsModule {}

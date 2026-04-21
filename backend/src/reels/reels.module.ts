import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReelsController } from './reels.controller';
import { ReelsService } from './reels.service';
import { Reel, ReelSchema } from './schemas/reel.schema';
import { Audio, AudioSchema } from './schemas/audio.schema';
import { PostsModule } from '../posts/posts.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    PostsModule,
    EventsModule,
    MongooseModule.forFeature([
      { name: Reel.name, schema: ReelSchema },
      { name: Audio.name, schema: AudioSchema },
    ]),
  ],
  controllers: [ReelsController],
  providers: [ReelsService],
  exports: [ReelsService],
})
export class ReelsModule {}

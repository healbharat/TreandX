import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoriesController } from './stories.controller';
import { StoriesService } from './stories.service';
import { Story, StorySchema } from './schemas/story.schema';
import { InteractionsModule } from '../interactions/interactions.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Story.name, schema: StorySchema }]),
    InteractionsModule,
  ],
  controllers: [StoriesController],
  providers: [StoriesService],
})
export class StoriesModule {}

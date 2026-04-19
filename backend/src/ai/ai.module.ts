import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { UsersModule } from '../users/users.module';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [UsersModule, PostsModule],
  controllers: [AIController],
  providers: [AIService],
})
export class AIModule {}

import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsersModule } from '../users/users.module';
import { PostsModule } from '../posts/posts.module';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [UsersModule, PostsModule, ReportsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

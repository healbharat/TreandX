import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';
import { ProfileView, ProfileViewSchema } from './schemas/profile-view.schema';
import { Block, BlockSchema } from './schemas/block.schema';
import { Subscription, SubscriptionSchema } from './schemas/subscription.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: ProfileView.name, schema: ProfileViewSchema },
      { name: Block.name, schema: BlockSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [MongooseModule, UsersService],
})
export class UsersModule {}

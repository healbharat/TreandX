import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EarningsController } from './earnings.controller';
import { EarningsService } from './earnings.service';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [EarningsController],
  providers: [EarningsService],
  exports: [EarningsService],
})
export class EarningsModule {}

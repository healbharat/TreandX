import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ad } from './schemas/ad.schema';

@Injectable()
export class AdsService {
  constructor(@InjectModel(Ad.name) private adModel: Model<Ad>) {}

  async getActiveAds() {
    return this.adModel.find({ status: 'active' }).exec();
  }

  // Admin method to create ads
  async createAd(data: any) {
    return this.adModel.create(data);
  }
}

import { Controller, Get } from '@nestjs/common';
import { AdsService } from './ads.service';

@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Get()
  async getAds() {
    return this.adsService.getActiveAds();
  }
}

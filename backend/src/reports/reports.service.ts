import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report } from './schemas/report.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<Report>,
  ) {}

  async createReport(reporterId: string, postId: string, reason: string) {
    return this.reportModel.create({
      reporterId,
      postId,
      reason,
    });
  }
}

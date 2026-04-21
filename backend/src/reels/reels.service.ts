import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reel } from './schemas/reel.schema';
import { Audio } from './schemas/audio.schema';
import { UploadService } from '../posts/upload.service';
import { EventsGateway } from '../events/events.gateway';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class ReelsService {
  constructor(
    @InjectModel(Reel.name) private reelModel: Model<Reel>,
    @InjectModel(Audio.name) private audioModel: Model<Audio>,
    private readonly uploadService: UploadService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async uploadReel(userId: string, videoFile: Express.Multer.File, caption?: string, audioId?: string) {
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { 
          resource_type: 'video',
          folder: 'reels',
          transformation: [
            { duration: 30, crop: "limit" }, 
            { width: 720, height: 1280, crop: "pad", background: "black" }, 
            { quality: "auto" }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(videoFile.buffer);
    }) as any;

    const reel = await this.reelModel.create({
      userId: new Types.ObjectId(userId),
      videoUrl: uploadResult.secure_url,
      thumbnail: uploadResult.secure_url.replace('.mp4', '.jpg').replace('.mov', '.jpg'),
      caption,
      audioId: audioId ? new Types.ObjectId(audioId) : null,
    });

    if (audioId) {
      await this.audioModel.findByIdAndUpdate(audioId, { $inc: { usageCount: 1 } });
    }

    return (reel as any).populate('userId', 'name username profileImage');
  }

  async getReels(page: number, limit: number = 5, userId?: string) {
    return this.reelModel
      .find()
      .populate('userId', 'name username profileImage')
      .populate('audioId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec();
  }

  async remixReel(userId: string, originalReelId: string, caption?: string) {
    const original = await this.reelModel.findById(originalReelId).populate('userId', 'username');
    if (!original) throw new NotFoundException('Original reel not found');

    const reel = await this.reelModel.create({
      userId: new Types.ObjectId(userId),
      videoUrl: original.videoUrl,
      caption: caption || `Remix with @${(original.userId as any).username}`,
      audioId: original.audioId,
      remixFrom: original._id,
    });

    return (reel as any).populate('userId', 'name username profileImage');
  }

  async incrementView(reelId: string) {
    return this.reelModel.findByIdAndUpdate(reelId, { $inc: { viewsCount: 1 } }, { returnDocument: 'after' });
  }

  async getAudios() {
    return this.audioModel.find().sort({ usageCount: -1 }).limit(50).exec();
  }
}

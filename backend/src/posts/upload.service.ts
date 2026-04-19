import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(file: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Cloudinary upload failed: no result'));
        resolve(result.secure_url);
      });
      upload.end(file.buffer);
    });
  }

  async deleteImage(imageUrl: string) {
    try {
      // Extract public_id from URL
      const parts = imageUrl.split('/');
      const filename = parts[parts.length - 1];
      const publicId = filename.split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.error('Failed to delete image from Cloudinary', err);
    }
  }
}

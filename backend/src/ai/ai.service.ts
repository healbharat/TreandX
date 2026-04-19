import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Post } from '../posts/schemas/post.schema';
import { User } from '../users/schemas/user.schema';
import { RedisService } from '../common/redis.service';

@Injectable()
export class AIService implements OnModuleInit {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  onModuleInit() {
    try {
      const apiKey = this.configService.get('GEMINI_API_KEY');
      if (apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        console.log('[GEMINI AI] Initialized with gemini-2.5-flash');
      }
    } catch (err) {
      console.error('[GEMINI AI] Initialization failed:', err.message);
    }
  }

  async summarize(content: string): Promise<string> {
    const cacheKey = `summary:${Buffer.from(content.substring(0, 50)).toString('base64')}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    if (!this.model) return 'AI Service not configured.';

    try {
      const prompt = `Summarize the following news content in exactly 2-3 concise lines. Be professional and objective: \n\n${content}`;
      const result = await this.model.generateContent(prompt);
      const summary = result.response.text() || 'Summary unavailable.';
      
      await this.redisService.set(cacheKey, summary, 3600 * 24);
      return summary;
    } catch (err) {
      console.error('[GEMINI AI] Summarization failed:', err.message);
      return 'Failed to generate summary.';
    }
  }

  async generateHeadline(content: string): Promise<string> {
    const cacheKey = `headline:${Buffer.from(content.substring(0, 50)).toString('base64')}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    if (!this.model) return 'AI Service not configured.';

    try {
      const prompt = `Generate ONE single, catchy, professional headline for the following news content. 
      IMPORTANT: Return ONLY the headline text. Do not provide options. Keep it under 10 words: \n\n${content}`;
      const result = await this.model.generateContent(prompt);
      const headline = result.response.text() || 'Headline unavailable.';
      
      // Remove quotes if AI decided to wrap it in them
      const cleanHeadline = headline.replace(/['"]+/g, '').trim();
      
      await this.redisService.set(cacheKey, cleanHeadline, 3600 * 24);
      return cleanHeadline;
    } catch (err) {
      console.error('[GEMINI AI] Headline generation failed:', err.message);
      return 'Failed to generate headline.';
    }
  }

  async getRecommendations(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) return [];

    const categories = user.interests.length > 0 ? user.interests : ['Local', 'Politics', 'Sports'];

    return this.postModel
      .find({
        category: { $in: categories },
        status: 'active',
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name username profileImage')
      .exec();
  }
}

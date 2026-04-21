import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { Post } from '../posts/schemas/post.schema';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Post.name) private postModel: Model<Post>,
  ) {}

  async searchAll(query: string) {
    const [users, posts] = await Promise.all([
      this.searchUsers(query, 5),
      this.searchPosts(query, 5),
    ]);
    return { users, posts };
  }

  async searchUsers(query: string, limit = 20) {
    return this.userModel
      .find(
        { $or: [
          { username: { $regex: query, $options: 'i' } },
          { name: { $regex: query, $options: 'i' } }
        ]},
      )
      .limit(limit)
      .exec();
  }

  async searchPosts(query: string, limit = 20) {
    return this.postModel
      .find(
        { $or: [
          { caption: { $regex: query, $options: 'i' } },
          { hashtags: { $in: [query.replace('#', '').toLowerCase()] } }
        ]}
      )
      .limit(limit)
      .populate('userId', 'name username profileImage')
      .exec();
  }

  async getExploreFeed(page: number = 1, limit: number = 20) {
    // 1. High engagement posts
    const posts = await this.postModel
      .find()
      .populate('userId', 'name username profileImage')
      .sort({ likesCount: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec();

    // 2. Mix in some random trending topics
    return posts;
  }

  async getTrending() {
    const recentPosts = await this.postModel
      .find({ createdAt: { $gt: new Date(Date.now() - 48 * 60 * 60 * 1000) } }) // Last 48h
      .select('hashtags')
      .lean()
      .exec();

    const hashtagMap = new Map<string, number>();
    
    recentPosts.forEach(post => {
      if (post.hashtags) {
        post.hashtags.forEach(tag => {
          hashtagMap.set(tag, (hashtagMap.get(tag) || 0) + 1);
        });
      }
    });

    return Array.from(hashtagMap.entries())
      .map(([tag, count]) => ({ tag: `#${tag}`, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  async searchByHashtag(tag: string) {
    const cleanTag = tag.replace('#', '').toLowerCase();
    return this.postModel
      .find({ hashtags: cleanTag })
      .populate('userId', 'name username profileImage')
      .sort({ likesCount: -1 })
      .exec();
  }
}

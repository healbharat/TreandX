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
        { $text: { $search: query } },
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .exec();
  }

  async searchPosts(query: string, limit = 20) {
    return this.postModel
      .find(
        { $text: { $search: query } },
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .populate('userId', 'name username profileImage')
      .exec();
  }

  async getTrending() {
    // Basic trending: Extract hashtags from last 200 posts
    const recentPosts = await this.postModel
      .find({ isFlagged: false })
      .sort({ createdAt: -1 })
      .limit(200)
      .select('content')
      .exec();

    const hashtagMap = new Map<string, number>();
    
    recentPosts.forEach(post => {
      const hashtags = post.content.match(/#[\w\d]+/g);
      if (hashtags) {
        hashtags.forEach(tag => {
          const cleanTag = tag.toLowerCase();
          hashtagMap.set(cleanTag, (hashtagMap.get(cleanTag) || 0) + 1);
        });
      }
    });

    const sortedTrending = Array.from(hashtagMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return sortedTrending;
  }
}

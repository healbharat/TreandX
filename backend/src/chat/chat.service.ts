import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation } from './schemas/conversation.schema';
import { Message } from './schemas/message.schema';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<Conversation>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async getConversations(userId: string) {
    return this.conversationModel
      .find({ members: new Types.ObjectId(userId) })
      .populate('members', 'name username profileImage')
      .populate('lastMessage')
      .sort({ updatedAt: -1 })
      .exec();
  }

  async getMessages(conversationId: string, userId: string) {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) throw new NotFoundException('Conversation not found');
    
    if (!conversation.members.includes(new Types.ObjectId(userId))) {
      throw new UnauthorizedException('Not a member of this conversation');
    }

    return this.messageModel
      .find({ conversationId: new Types.ObjectId(conversationId) })
      .populate('senderId', 'name username profileImage')
      .sort({ createdAt: 1 })
      .exec();
  }

  async sendMessage(userId: string, data: { conversationId: string, text?: string, mediaUrl?: string, mediaType?: string }) {
    const conversation = await this.conversationModel.findById(data.conversationId);
    if (!conversation) throw new NotFoundException('Conversation not found');

    const message = await this.messageModel.create({
      conversationId: new Types.ObjectId(data.conversationId),
      senderId: new Types.ObjectId(userId),
      text: data.text,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
    });

    await this.conversationModel.findByIdAndUpdate(data.conversationId, {
      lastMessage: message._id,
    });

    const populatedMessage = await message.populate('senderId', 'name username profileImage');

    // Notify all members via Socket
    conversation.members.forEach(memberId => {
      this.eventsGateway.server.to(memberId.toString()).emit('newMessage', populatedMessage);
    });

    return populatedMessage;
  }

  async createConversation(userId: string, memberIds: string[], isGroup: boolean = false, groupName?: string) {
    // Add current user to members
    const allMembers = Array.from(new Set([...memberIds, userId])).map(id => new Types.ObjectId(id));

    // If 1-to-1, check for existing
    if (!isGroup && allMembers.length === 2) {
      const existing = await this.conversationModel.findOne({
        isGroup: false,
        members: { $all: allMembers, $size: 2 }
      });
      if (existing) return existing.populate('members', 'name username profileImage');
    }

    const conversation = await this.conversationModel.create({
      members: allMembers,
      isGroup,
      groupName,
      createdBy: new Types.ObjectId(userId),
    });

    return conversation.populate('members', 'name username profileImage');
  }

  async markAsSeen(messageId: string, userId: string) {
    return this.messageModel.findByIdAndUpdate(
      messageId,
      { $addToSet: { seenBy: new Types.ObjectId(userId) } },
      { returnDocument: 'after' }
    );
  }

  async addReaction(messageId: string, userId: string, emoji: string) {
    await this.messageModel.findByIdAndUpdate(
      messageId,
      { $push: { reactions: { userId: new Types.ObjectId(userId), emoji } } },
      { returnDocument: 'after' }
    );
    const message = await this.messageModel.findById(messageId);
    if (!message) throw new NotFoundException('Message not found');

    this.eventsGateway.server.to(message.conversationId.toString()).emit('messageReaction', { messageId, userId, emoji });
    
    return message;
  }
}

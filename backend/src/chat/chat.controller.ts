import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  async getConversations(@Request() req) {
    return this.chatService.getConversations(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('messages/:id')
  async getMessages(@Param('id') id: string, @Request() req) {
    return this.chatService.getMessages(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('message')
  async sendMessage(@Body() data: { conversationId: string, text?: string, mediaUrl?: string, mediaType?: string }, @Request() req) {
    return this.chatService.sendMessage(req.user.userId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('conversation')
  async createConversation(@Body() data: { memberIds: string[], isGroup?: boolean, groupName?: string }, @Request() req) {
    return this.chatService.createConversation(req.user.userId, data.memberIds, data.isGroup, data.groupName);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('message/:id/seen')
  async markAsSeen(@Param('id') id: string, @Request() req) {
    return this.chatService.markAsSeen(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('message/:id/reaction')
  async addReaction(@Param('id') id: string, @Body('emoji') emoji: string, @Request() req) {
    return this.chatService.addReaction(id, req.user.userId, emoji);
  }
}

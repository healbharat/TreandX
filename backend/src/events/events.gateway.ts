import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`[WS] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[WS] Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, userId: string) {
    client.join(userId);
    console.log(`[WS] User ${userId} joined their notification room`);
  }

  emitNewLike(data: any) {
    this.server.emit('new-like', data);
  }

  emitNewComment(data: any) {
    this.server.emit('new-comment', data);
  }

  emitNewFollow(data: any) {
    this.server.emit('new-follow', data);
  }
}

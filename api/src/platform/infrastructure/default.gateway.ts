import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket, Socket as SocketIOSocket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Notification } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedSocket extends SocketIOSocket {
  user?: { id: string };
}

interface NotificationEventPayload {
  notification: Notification;
  unreadCount: number;
}

interface AddCommentEventPayload {
  userId: string;
  publicationId?: string;
  lessonId?: string;
  comment: Comment;
  type: string;
}

interface AddReplyToCommentEventPayload {
  userId: string;
  publicationId?: string;
  lessonId?: string;
  respondToId: string;
  comment: Comment;
  type: string;
}

interface DeletedNotificationEventPayload {
  id: string;
  unreadCount: number;
}

@WebSocketGateway(3002, {
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class DefaultGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(DefaultGateway.name);
  private connectedUsers: Map<string, Set<string>> = new Map();

  constructor(
    private _jwt: JwtService,
    private _configService: ConfigService,
  ) {}

  private getUserIdFromSocket(client: Socket): string | null {
    const token = client.handshake.query.token as string;

    if (token) {
      try {
        const decoded = this._jwt.verify(
          token,
          this._configService.get('JWT_SECRET'),
        );
        return decoded['id'];
      } catch (error) {
        this.logger.error('WebSocket Auth Error:', error.message);
        return null;
      }
    }
    return null;
  }

  async handleConnection(client: AuthenticatedSocket) {
    const userId = this.getUserIdFromSocket(client);
    if (userId) {
      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, new Set());
      }
      this.connectedUsers.get(userId).add(client.id);
      client.user = { id: userId };
      this.logger.log(`Client connected: ${client.id}, User ID: ${userId}`);
    } else {
      this.logger.warn(
        `Client ${client.id} connection rejected: No valid authentication.`,
      );
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.user?.id) {
      const userSockets = this.connectedUsers.get(client.user.id);
      if (userSockets) {
        userSockets.delete(client.id);
        if (userSockets.size === 0) {
          this.connectedUsers.delete(client.user.id);
        }
      }
    }
    this.logger.log(
      `Client disconnected: ${client.id}, User ID: ${client.user?.id || 'N/A'}`,
    );
  }

  private sendToUser(userId: string, event: string, payload: any) {
    const socketIds = this.connectedUsers.get(userId);
    if (socketIds) {
      socketIds.forEach((socketId) => {
        this.server.to(socketId).emit(event, payload);
      });
    }
  }

  sendNewNotificationToUser(
    userId: string,
    notification: Notification,
    unreadCount: number,
  ) {
    const payload: NotificationEventPayload = { notification, unreadCount };
    this.sendToUser(userId, 'new_notification', payload);
  }

  sendUpdatedNotificationToUser(
    userId: string,
    notification: Notification,
    unreadCount: number,
  ) {
    const payload: NotificationEventPayload = { notification, unreadCount };
    this.sendToUser(userId, 'notification_updated', payload);
  }

  sendDeletedNotificationToUser(
    userId: string,
    notificationId: string,
    unreadCount: number,
  ) {
    const payload: DeletedNotificationEventPayload = {
      id: notificationId,
      unreadCount,
    };
    this.sendToUser(userId, 'notification_deleted', payload);
  }

  sendAllNotificationsReadEventToUser(userId: string, unreadCount: number) {
    this.sendToUser(userId, 'all_notifications_read', { unreadCount });
  }

  sendAddCommentToPublication(
    userId: string,
    publicationId: string,
    comment: Comment,
  ) {
    const payload: AddCommentEventPayload = {
      userId,
      publicationId,
      comment,
      type: 'publication',
    };
    this.server.emit('addComment', payload);
  }

  sendAddFeedItem(feedItem: any) {
    this.logger.log(`Broadcasting addFeedItem event for item: ${feedItem.id}`);
    this.server.emit('addFeedItem', feedItem);
  }

  sendRemoveFeedItem(params: { targetType: string; targetId: string }) {
    this.logger.log(
      `Broadcasting removeFeedItem event for target: ${params.targetType}:${params.targetId}`,
    );
    this.server.emit('removeFeedItem', params);
  }

  sendAddReplyToCommentInPublication(
    userId: string,
    publicationId: string,
    respondToId: string,
    comment: Comment,
  ) {
    const payload: AddReplyToCommentEventPayload = {
      userId,
      publicationId,
      respondToId,
      comment,
      type: 'publication',
    };
    this.server.emit('addReplyToComment', payload);
  }

  sendAddCommentToLesson(userId: string, lessonId: string, comment: Comment) {
    const payload: AddCommentEventPayload = {
      userId,
      lessonId,
      comment,
      type: 'lesson',
    } as any;
    this.server.emit('addComment', payload);
  }

  sendAddReplyToCommentInLesson(
    userId: string,
    lessonId: string,
    respondToId: string,
    comment: Comment,
  ) {
    const payload: AddReplyToCommentEventPayload = {
      userId,
      lessonId,
      respondToId,
      comment,
      type: 'lesson',
    } as any;
    this.server.emit('addReplyToComment', payload);
  }

  sendAddThreadReply(reply: any) {
    this.server.emit('addThreadReply', { reply });
  }
}

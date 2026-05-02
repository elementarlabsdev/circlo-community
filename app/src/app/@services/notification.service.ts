import {
  Injectable,
  signal,
  effect,
  inject,
  WritableSignal,
  DestroyRef,
  Injector, PLATFORM_ID
} from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WebSocketService } from './web-socket.service';
import { AuthService } from './auth.service';
import { ApiService } from '@services/api.service';
import { isPlatformServer } from '@angular/common';
import { AppStore } from '@store/app.store';

export interface ClientNotification {
  id: string;
  userId: string;
  type: string;
  message: string;
  data?: any;
  link?: string;
  isRead: boolean;
  relatedEntityId?: string;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private appStore = inject(AppStore);
  private http = inject(ApiService);
  private webSocketService = inject(WebSocketService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);

  private apiUrl = 'notifications';

  readonly notifications: WritableSignal<ClientNotification[]> = signal([]);
  readonly unreadCount: WritableSignal<number> = signal(0);
  readonly isLoadingInitial: WritableSignal<boolean> = signal(false);

  initialize() {
    const isAuthenticated = this.authService.isLogged();

    if (isAuthenticated) {
      this.initializeNotifications();
    } else {
      this.webSocketService.disconnect();
      this.notifications.set([]);
      this.appStore.setUnreadNotificationsCount(0);
    }
  }

  listenForAuthChanges() {
    this.authService.loggedChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.initialize();
      });
  }

  private initializeNotifications(): void {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    this.webSocketService.connect();
    this.listenForNotifications();
  }

  private listenForNotifications(): void {
    this.webSocketService.listen<ClientNotification>('new_notification')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(notification => {
        this.appStore.setUnreadNotificationsCount(notification.unreadCount);
      });

    this.webSocketService.listen<ClientNotification>('notification_updated')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(updatedNotification => {
        this.appStore.setUnreadNotificationsCount(updatedNotification.unreadCount);
      });

    this.webSocketService.listen<{ id: string }>('notification_deleted')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        // this.appStore.setUnreadNotificationsCount(data.unreadCount);
      });

    this.webSocketService.listen<void>('all_notifications_read')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.appStore.setUnreadNotificationsCount(0);
      });
  }

  fetchInitialNotifications(limit: number = 20, offset: number = 0): void {
    if (offset === 0) this.isLoadingInitial.set(true);
    let params = new HttpParams().set('limit', limit.toString()).set('offset', offset.toString());

    this.http.get<ClientNotification[]>(this.apiUrl, { params })
      .subscribe({
        next: fetchedNotifications => {
          if (offset === 0) {
            this.notifications.set(fetchedNotifications);
          } else {
            this.notifications.update(current => [...current, ...fetchedNotifications]);
          }
          if (offset === 0) this.isLoadingInitial.set(false);
        },
        error: () => {
          if (offset === 0) this.isLoadingInitial.set(false);
        }
      });
  }

  fetchUnreadCount(): void {
    this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`)
      .subscribe(response => {
        this.appStore.setUnreadNotificationsCount(response.count);
      });
  }

  markAsRead(notificationId: string): void {
    this.http.patch<ClientNotification>(`${this.apiUrl}/${notificationId}/read`, {})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(updatedNotification => {
        this.fetchUnreadCount();
      });
  }

  markAllAsRead(): void {
    this.http.patch<{ count: number }>(`${this.apiUrl}/read-all`, {})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.appStore.setUnreadNotificationsCount(0);
      });
  }

  deleteNotification(notificationId: string): void {
    this.http.delete(`${this.apiUrl}/${notificationId}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        // this.notifications.update(current => current.filter(n => n.id !== notificationId));
        this.fetchUnreadCount();
      });
  }
}

import { Injectable, inject, NgZone } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ManagerOptions, SocketOptions } from 'socket.io-client';
import { ApiService } from '@services/api.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private api = inject(ApiService);
  private socket = inject(Socket);
  private ngZone = inject(NgZone);

  private getAuthToken(): string {
    return  this.api.getAuthToken() || '';
  }

  connect(): void {
    this.ngZone.runOutsideAngular(() => {
      const token = this.getAuthToken();

      const clientSocketInstance = this.socket.ioSocket;

      if (clientSocketInstance && clientSocketInstance.io) {
        (clientSocketInstance.io.opts as Partial<ManagerOptions & SocketOptions>).query = { token };
      }

      if (this.socket.ioSocket?.connected) {
        // If connected but token changed, we need to reconnect
        const currentQuery = (this.socket.ioSocket.io.opts as any).query;
        if (currentQuery?.token !== token) {
          this.socket.disconnect();
          this.socket.connect();
        }
        return;
      }

      this.socket.connect();
    });
  }

  disconnect(): void {
    if (this.socket.ioSocket?.connected) {
      this.socket.disconnect();
    }
  }

  listen<T>(eventName: string): Observable<T> {
    return this.socket
      .fromEvent(eventName)
      .pipe(
        map(data => data as T)
      );
  }

  emit(eventName: string, data?: unknown): void {
    this.socket.emit(eventName, data);
  }

  isConnected(): boolean {
    return this.socket.ioSocket?.connected || false;
  }
}

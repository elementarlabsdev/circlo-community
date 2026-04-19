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
      if (this.socket.ioSocket?.connected) {
        return;
      }

      const token = this.getAuthToken();

      if (!token && (this.socket.ioSocket && this.socket.ioSocket.active)) {
        this.socket.disconnect();
      }

      const clientSocketInstance = this.socket.ioSocket;

      if (clientSocketInstance && clientSocketInstance.io) {
        (clientSocketInstance.io.opts as Partial<ManagerOptions & SocketOptions>).query = { token };
      } else {
        console.error(
          "WebSocketService: Socket manager (ioSocket.io) is not available. " +
          "The token might not be sent with the initial connection."
        );
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

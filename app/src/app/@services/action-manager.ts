import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ActionManager {
  readonly action = new EventEmitter<{ action: string; payload: any }>();
}

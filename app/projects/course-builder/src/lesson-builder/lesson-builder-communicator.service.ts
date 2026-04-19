import { EventEmitter, Injectable } from '@angular/core';
import { BlockData } from '../models/lesson-block.model';

@Injectable({
  providedIn: 'root'
})
export class LessonBuilderCommunicatorService {
  private _blockDataChanged = new EventEmitter<{ blockId: any, data: any }>();

  updateBlockData(blockId: any, data: any) {
    this._blockDataChanged.emit({ blockId, data });
  }

  blockDataChanged() {
    return this._blockDataChanged;
  }
}

import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { ContentEditorBlock } from './types';

type ContentBuilderState = {
  focusedBlockId: string | null;
  activeBlockId: string | null;
  blocks: ContentEditorBlock[]
};

const initialState: ContentBuilderState = {
  focusedBlockId: null,
  activeBlockId: null,
  blocks: []
};

export const ContentBuilderStore = signalStore(
  withState(initialState),
  withMethods((store) => ({
    setFocusedBlockId(focusedBlockId: string | null): void {
      patchState(store, (state) => ({ focusedBlockId }));
    },
    setActiveBlockId(activeBlockId: string | null): void {
      patchState(store, (state) => ({ activeBlockId }));
    },
    setBlocks(blocks: ContentEditorBlock[]) {
      patchState(store, (state) => ({ blocks }));
    },
    addBlock(dataBlock: ContentEditorBlock, index: number): void {
      patchState(store, (state) => {
        state.blocks.splice(index, 0, dataBlock);
        return {
          ...state
        }
      });
    },
    deleteBlock(blockId: string, index: number): void {
      patchState(store, (state) => {
        state.blocks.splice(index, 1);
        return {
          ...state
        }
      });
    },
    updateBlock(blockId: string, data: any): void {
      patchState(store, (state) => {
        const index = state.blocks.findIndex(block => block.id === blockId);
        state.blocks[index] = {
          ...state.blocks[index],
          ...data
        };
        return {
          ...state
        }
      });
    },
    moveBlock(fromIndex: number, toIndex: number): void {
      patchState(store, (state) => {
        const newBlocks = [...state.blocks];
        const [movedItem] = newBlocks.splice(fromIndex, 1);
        newBlocks.splice(toIndex, 0, movedItem);
        return {
          ...state,
          blocks: newBlocks,
        };
      });
    },
  }))
);

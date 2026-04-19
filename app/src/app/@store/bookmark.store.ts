import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

export interface BookmarkState {
  bookmarks: {id: string}[];
}

const initialState: BookmarkState = {
  bookmarks: []
};

export const BookmarkStore = signalStore(
  { providedIn: 'root', protectedState: false },
  withState<BookmarkState>(initialState),
  withMethods((store) => ({
    set(bookmarks: any[]): void {
      patchState(store, {
        bookmarks
      });
    },
    add(targetId: string): void {
      const bookmarks = store.bookmarks();
      const index = bookmarks.findIndex(_ => _.id === targetId);

      if (index === -1) {
        patchState(store, {
          bookmarks: [...bookmarks, { id: targetId }]
        });
      }
    },
    delete(targetId: string): void {
      const bookmarks = [...store.bookmarks()];
      const index = bookmarks.findIndex(_ => _.id === targetId);

      if (index !== -1) {
        bookmarks.splice(index, 1);
        patchState(store, {
          bookmarks
        });
      }
    },
    has(targetId: string): boolean {
      const subscriptions = store.bookmarks();
      const index = subscriptions.findIndex(_ => _.id === targetId);
      return index !== -1;
    }
  }))
);

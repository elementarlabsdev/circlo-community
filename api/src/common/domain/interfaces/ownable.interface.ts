export interface IOwnable {
  authorId?: string;
  ownerId?: string;
}

export function isOwnable(object: any): object is IOwnable {
  return (
    object &&
    typeof object === 'object' &&
    ('authorId' in object || 'ownerId' in object)
  );
}

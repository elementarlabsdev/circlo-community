export interface File {
  id: string;
  size: number;
  mimeType: string;
  category: string;
  name: string;
  itemsCount: number;
  extension?: string;
  url: string;
}

export interface FileSelectedEvent {
  files: File[]
}

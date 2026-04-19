export interface MediaItemProps {
  id: string;
  extension: string;
  path: string;
  url: string;
  name: string;
  size: number;
  category: string;
  type: string;
  mimeType: string;
  deleted: boolean;
  temporary: boolean;
  createdAt: Date;
  uploadedById: string;
  fileStorageProviderId: string;
  folderId?: string | null;
}

export class MediaItemEntity {
  public readonly id: string;
  public extension: string;
  public path: string;
  public url: string;
  public name: string;
  public size: number;
  public category: string;
  public type: string;
  public mimeType: string;
  public deleted: boolean;
  public temporary: boolean;
  public readonly createdAt: Date;
  public readonly uploadedById: string;
  public readonly fileStorageProviderId: string;
  public folderId?: string | null;

  private constructor(props: MediaItemProps) {
    this.id = props.id;
    this.extension = props.extension;
    this.path = props.path;
    this.url = props.url;
    this.name = props.name;
    this.size = props.size;
    this.category = props.category;
    this.type = props.type;
    this.mimeType = props.mimeType;
    this.deleted = props.deleted ?? false;
    this.temporary = props.temporary ?? true;
    this.createdAt = props.createdAt;
    this.uploadedById = props.uploadedById;
    this.fileStorageProviderId = props.fileStorageProviderId;
    this.folderId = props.folderId ?? null;
  }

  static reconstitute(props: MediaItemProps): MediaItemEntity {
    return new MediaItemEntity(props);
  }

  markDeleted() {
    this.deleted = true;
  }

  moveToFolder(folderId: string | null) {
    this.folderId = folderId;
  }

  rename(name: string) {
    this.name = name;
  }

  toPrimitives(): MediaItemProps {
    return {
      id: this.id,
      extension: this.extension,
      path: this.path,
      url: this.url,
      name: this.name,
      size: this.size,
      category: this.category,
      type: this.type,
      mimeType: this.mimeType,
      deleted: this.deleted,
      temporary: this.temporary,
      createdAt: this.createdAt,
      uploadedById: this.uploadedById,
      fileStorageProviderId: this.fileStorageProviderId,
      folderId: this.folderId ?? null,
    };
  }
}

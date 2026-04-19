export interface FileStorageProviderProps {
  id: string;
  name: string;
  type: string;
  position: number;
  description: string | null;
  accessKeyId?: string | null;
  secretAccessKey?: string | null;
  region?: string | null;
  bucket?: string | null;
  useAcl: boolean;
  isConfigured: boolean;
  isEnabled: boolean;
  isDefault: boolean;
  cdnEnabled: boolean;
}

export class FileStorageProvider {
  public readonly id: string;
  public readonly name: string;
  public readonly type: string;
  public position: number;
  public description: string | null;
  public accessKeyId?: string | null;
  public secretAccessKey?: string | null;
  public region?: string | null;
  public bucket?: string | null;
  public useAcl: boolean;
  public isConfigured: boolean;
  public isEnabled: boolean;
  public isDefault: boolean;
  public cdnEnabled: boolean;

  private constructor(props: FileStorageProviderProps) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.position = props.position;
    this.description = props.description ?? null;
    this.accessKeyId = props.accessKeyId ?? null;
    this.secretAccessKey = props.secretAccessKey ?? null;
    this.region = props.region ?? null;
    this.bucket = props.bucket ?? null;
    this.useAcl = props.useAcl ?? false;
    this.isConfigured = props.isConfigured;
    this.isEnabled = props.isEnabled;
    this.isDefault = props.isDefault;
    this.cdnEnabled = props.cdnEnabled ?? false;
  }

  static reconstitute(props: FileStorageProviderProps): FileStorageProvider {
    return new FileStorageProvider(props);
  }

  update(data: {
    isEnabled?: boolean;
    accessKeyId?: string | null;
    secretAccessKey?: string | null;
    region?: string | null;
    bucket?: string | null;
    useAcl?: boolean;
    isConfigured?: boolean;
    isDefault?: boolean;
    cdnEnabled?: boolean;
  }) {
    if (typeof data.isEnabled === 'boolean') {
      this.isEnabled = data.isEnabled;
    }
    if (data.accessKeyId !== undefined) {
      this.accessKeyId = data.accessKeyId;
    }
    if (data.secretAccessKey !== undefined) {
      this.secretAccessKey = data.secretAccessKey;
    }
    if (data.region !== undefined) {
      this.region = data.region;
    }
    if (data.bucket !== undefined) {
      this.bucket = data.bucket;
    }
    if (typeof data.useAcl === 'boolean') {
      this.useAcl = data.useAcl;
    }
    if (typeof data.isConfigured === 'boolean') {
      this.isConfigured = data.isConfigured;
    }
    if (typeof data.isDefault === 'boolean') {
      this.isDefault = data.isDefault;
    }
    if (typeof data.cdnEnabled === 'boolean') {
      this.cdnEnabled = data.cdnEnabled;
    }
  }

  toPrimitives() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      position: this.position,
      description: this.description,
      accessKeyId: this.accessKeyId ?? null,
      secretAccessKey: this.secretAccessKey ?? null,
      region: this.region ?? null,
      bucket: this.bucket ?? null,
      useAcl: this.useAcl,
      isConfigured: this.isConfigured,
      isEnabled: this.isEnabled,
      isDefault: this.isDefault,
      cdnEnabled: this.cdnEnabled,
    };
  }
}

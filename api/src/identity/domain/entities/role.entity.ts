export interface Permission {
  id?: string;
  action: string;
  subject: string;
  conditions?: any;
  inverted?: boolean;
  reason?: string;
}

export class Role {
  constructor(
    public readonly id: string,
    public readonly type: string,
    public readonly name: string,
    public readonly isBuiltIn: boolean = false,
    public readonly permissions: Permission[] = [],
    public readonly parentId: string | null = null,
    public readonly parent?: Role | null,
  ) {}
}

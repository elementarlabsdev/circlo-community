export interface UserDashboardProps {
  id: string;
  userId: string;
  layout: any[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserDashboard {
  public readonly id: string;
  public readonly userId: string;
  private _layout: any[];
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  private constructor(props: UserDashboardProps) {
    this.id = props.id;
    this.userId = props.userId;
    this._layout = Array.isArray(props.layout) ? props.layout : [];
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static reconstitute(props: UserDashboardProps): UserDashboard {
    return new UserDashboard(props);
  }

  get layout(): any[] {
    return this._layout;
  }

  setLayout(layout: any[]): void {
    this._layout = Array.isArray(layout) ? layout : [];
  }

  toPrimitives() {
    return {
      id: this.id,
      userId: this.userId,
      layout: this._layout,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

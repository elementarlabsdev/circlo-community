export interface LayoutWidgetDefProps {
  id: string;
  name: string;
  description: string | null;
  type: string; // unique widget type key
  settings: any; // JSON blob
  position: number;
}

export class LayoutWidgetDef {
  public readonly id: string;
  public readonly name: string;
  public readonly type: string;
  public description: string | null;
  public settings: any;
  public position: number;

  private constructor(props: LayoutWidgetDefProps) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.description = props.description ?? null;
    this.settings = props.settings ?? {};
    this.position = props.position ?? 0;
  }

  public static reconstitute(props: LayoutWidgetDefProps): LayoutWidgetDef {
    return new LayoutWidgetDef(props);
  }

  public updateDetails(props: {
    description?: string | null;
    settings?: any;
    position?: number;
  }): void {
    if (typeof props.description !== 'undefined') this.description = props.description;
    if (typeof props.settings !== 'undefined') this.settings = props.settings;
    if (typeof props.position === 'number') this.position = props.position;
  }

  public toPrimitives() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      settings: this.settings,
      position: this.position,
    };
  }
}

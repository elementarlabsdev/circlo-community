import { v4 as uuidv4 } from 'uuid';

export interface MenuItemCreateProps {
  name: string;
  url: string; // В реальном проекте это мог бы быть VO `MenuItemUrl`
  position: number;
  iconId?: string;
  authorisedOnly: boolean;
  iconName?: string;
  iconUrl?: string;
}

export class MenuItem {
  public readonly id: string;
  public readonly name: string;
  public readonly url: string;
  public readonly position: number;
  public readonly iconId?: string;
  public readonly authorisedOnly: boolean;
  public readonly iconName?: string;
  public readonly iconUrl?: string;

  private constructor(props: { id: string } & MenuItemCreateProps) {
    this.id = props.id;
    this.name = props.name;
    this.url = props.url;
    this.position = props.position;
    this.iconId = props.iconId;
    this.authorisedOnly = props.authorisedOnly;
    this.iconUrl = props.iconUrl;
    this.iconName = props.iconName;
  }

  public static create(props: MenuItemCreateProps): MenuItem {
    // Здесь могут быть бизнес-правила, например:
    if (props.position < 0) {
      throw new Error('Position cannot be negative.');
    }
    if (!props.name.trim()) {
      throw new Error('Menu item name must not be empty.');
    }

    return new MenuItem({ id: uuidv4(), ...props });
  }

  // Метод для восстановления из БД
  public static reconstitute(
    props: { id: string } & MenuItemCreateProps,
  ): MenuItem {
    return new MenuItem(props);
  }
}

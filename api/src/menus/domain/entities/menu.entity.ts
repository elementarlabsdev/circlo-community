import { v4 as uuidv4 } from 'uuid';
import { MenuItem, MenuItemCreateProps } from '../entities/menu-item.entity';

export interface MenuCreateProps {
  name: string;
  type: string;
}

export class Menu {
  public readonly id: string;
  public name: string;
  public readonly type: string;
  public position: number;
  private _items: MenuItem[] = [];

  private constructor(props: {
    id: string;
    name: string;
    type: string;
    position: number;
    items?: MenuItem[];
  }) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.position = props.position;
    this._items = props.items ?? [];
  }

  public static create(props: MenuCreateProps): Menu {
    return new Menu({
      id: uuidv4(),
      name: props.name,
      type: props.type,
      position: 0,
    });
  }

  // Method for reconstituting from the database
  public static reconstitute(props: {
    id: string;
    name: string;
    type: string;
    position: number;
    items: MenuItem[];
  }): Menu {
    return new Menu(props);
  }

  public addItem(props: MenuItemCreateProps): void {
    // Business rule that protects the aggregate
    if (this.type === 'HEADER' && this._items.length >= 10) {
      throw new Error('The main menu cannot contain more than 10 items.');
    }

    const newItem = MenuItem.create(props);
    this._items.push(newItem);
  }

  public removeItem(itemId: string): void {
    this._items = this._items.filter((item) => item.id !== itemId);
  }


  get items(): readonly MenuItem[] {
    return [...this._items].sort((a, b) => a.position - b.position);
  }


  /**
   * Converts the aggregate to a "flat" structure for saving to the database.
   */
  public toPrimitives() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      position: this.position,
      items: this._items.map((item) => ({
        id: item.id,
        name: item.name,
        url: item.url,
        iconName: item.iconName,
        iconUrl: item.iconUrl,
        position: item.position,
        iconId: item.iconId,
        authorisedOnly: item.authorisedOnly,
      })),
    };
  }
}

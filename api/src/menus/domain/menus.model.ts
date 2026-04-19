export type MenuViewModel = {
  id: string;
  name: string;
  type: string;
  position: number;
  isPublished: boolean;
  items: {
    id: string;
    name: string;
    url: string;
    position: number;
  }[];
};

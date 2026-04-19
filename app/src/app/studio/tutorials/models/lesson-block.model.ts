import { Type } from '@angular/core';

export interface TextBlockData {
  content: string;
}

export interface YoutubeBlockData {
  embedUrl: string;
}

export interface CodeBlockData {
  content: string;
  language: string;
}

export interface ImageBlockData {
  src: string;
  alt: string;
  align: string;
  width: number;
  height: number;
}

export interface QuizBlockData {
  question: string;
}

export type BlockData = TextBlockData | ImageBlockData | QuizBlockData | CodeBlockData | YoutubeBlockData;

export interface LessonBlock<T extends BlockData = BlockData> {
  id: string;
  component: Type<any>;
  type: 'text' | 'image' | 'code' | 'youtube';
  data: T;
}

export interface PaletteBlock<T extends BlockData> {
  type: 'text' | 'image' | 'code' | 'youtube';
  name: string;
  component: Type<any>;
  settings?: Type<any>;
  defaultData: T;
  icon: string;
}

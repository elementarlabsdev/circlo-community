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

export interface HeadingBlockData {
  content: string;
  level: number; // 1..6
}

export type BlockData = TextBlockData | ImageBlockData | QuizBlockData | CodeBlockData | YoutubeBlockData | HeadingBlockData;

export interface LessonBlock<T extends BlockData = BlockData> {
  id: string;
  component: Type<any>;
  type: 'text' | 'image' | 'code' | 'youtube' | 'heading';
  data: T;
}

export interface PaletteBlock<T extends BlockData> {
  type: 'text' | 'image' | 'code' | 'youtube' | 'heading';
  name: string;
  component: Type<any>;
  settings?: Type<any>;
  defaultData: T;
  icon: string;
}

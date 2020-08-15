import { Record, RecordOf } from 'immutable';

export interface IPoint {
  x: number;
  y: number;
}

export type Point = RecordOf<IPoint>;
export const makePoint = Record<IPoint>({ x: 0, y: 0 });

export interface IOffset {
  x: number;
  y: number;
}

export type Offset = RecordOf<IOffset>;
export const makeOffset = Record<IOffset>({ x: 0, y: 0 });

export interface ISize {
  w: number;
  h: number;
}

export type Size = RecordOf<ISize>;
export const makeSize = Record<ISize>({ w: 0, h: 0 });

export interface IRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type Rect = RecordOf<IRect>;
export const makeRect = Record<IRect>({ x: 0, y: 0, w: 0, h: 0 });

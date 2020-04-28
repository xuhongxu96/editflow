export interface Point { x: number, y: number }
export interface Offset { x: number, y: number }
export interface Size { w: number, h: number }

export interface Rect {
    x: number,
    y: number,
    w: number,
    h: number,
}

export const EmptyRect: Rect = { x: 0, y: 0, w: 0, h: 0 };
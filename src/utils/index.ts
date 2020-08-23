import { IRect, IPoint } from 'models/BasicTypes';
import { Node } from 'models/Flow';
import { HandleDirection } from 'components/HandleBox';

export type valueof<T> = T[keyof T];

export const isIntersected = (r1: IRect, r2: IRect) => {
  return r1.x <= r2.x + r2.w && r1.y <= r2.y + r2.h && r1.x + r1.w >= r2.x && r1.y + r1.h >= r2.y;
};

export const isContained = (parent: IRect, child: IRect) => {
  return (
    parent.x <= child.x &&
    parent.y <= child.y &&
    parent.x + parent.w >= child.x + child.w &&
    parent.y + parent.h >= child.y + child.h
  );
};

export const expandRect = (r: IRect, margin: number, scale: number = 1): IRect => {
  return {
    x: (r.x - margin) * scale,
    y: (r.y - margin) * scale,
    w: Math.max(0, r.w + margin * 2) * scale,
    h: Math.max(0, r.h + margin * 2) * scale,
  };
};

export const expandRectToContain = (r: IRect, toBeContained: IRect): IRect => {
  return {
    x: r.x > toBeContained.x ? toBeContained.x : r.x,
    y: r.y > toBeContained.y ? toBeContained.y : r.y,
    w:
      r.x + r.w < toBeContained.x + toBeContained.w ? toBeContained.x + toBeContained.w - r.x : r.w,
    h:
      r.y + r.h < toBeContained.y + toBeContained.h ? toBeContained.y + toBeContained.h - r.y : r.h,
  };
};

export const limitRect = (r: IRect, limit: IRect): IRect => {
  // Because limit rect has a padding, when limit right < view width,
  // it will force the view origin change to (-paddingW, -paddingH).
  // The following 2 lines make (0, 0) possible to be view origin.
  if (r.w > limit.x + limit.w) limit.w = r.w - limit.x;
  if (r.h > limit.y + limit.h) limit.h = r.h - limit.y;

  if (r.x + r.w > limit.x + limit.w) r.x = limit.x + limit.w - r.w;
  else if (r.x < limit.x) r.x = limit.x;

  if (r.y + r.h > limit.y + limit.h) r.y = limit.y + limit.h - r.h;
  else if (r.y < limit.y) r.y = limit.y;

  return r;
};

export const getPortPosition = (node: Node, type: 'input' | 'output', index: number): IPoint => {
  return {
    x: node.layout.x + (node.layout.w * (index + 1)) / (node[type].length + 1),
    y: type === 'input' ? node.layout.y - 2 : node.layout.y + node.layout.h + 2,
  };
};

export const getPortDraftPosition = (
  node: Node,
  draftLayout: IRect,
  type: 'input' | 'output',
  index: number
): IPoint => {
  return {
    x: draftLayout.x + (draftLayout.w * (index + 1)) / (node[type].length + 1),
    y: type === 'input' ? draftLayout.y - 2 : draftLayout.y + draftLayout.h + 2,
  };
};

export const DecomposeHandleDirection = (
  d: HandleDirection
): ['left' | 'right', 'top' | 'middle' | 'bottom'] => {
  const h = d === 'left-bottom' || d === 'left-middle' || d === 'left-top' ? 'left' : 'right';
  const v =
    d === 'left-bottom' || d === 'right-bottom'
      ? 'bottom'
      : d === 'left-middle' || d === 'right-middle'
      ? 'middle'
      : 'top';
  return [h, v];
};

function isClipboardApiSupport(): boolean {
  return navigator?.clipboard?.writeText && navigator.clipboard.readText ? true : false;
}

export function copyText(text: string): Promise<void> {
  if (isClipboardApiSupport()) return navigator.clipboard.writeText(text);
  return new Promise<void>(resolve => {
    localStorage.setItem('editflow.copy', text);
    resolve();
  });
}

export function pasteText(): Promise<string> {
  if (isClipboardApiSupport()) return navigator.clipboard.readText();
  return new Promise<string>(resolve => {
    const text = localStorage.getItem('editflow.copy');
    resolve(text === null ? '' : text);
  });
}

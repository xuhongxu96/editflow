import { Rect, Point } from "models/BasicTypes";
import { Node } from "models/Flow";

export type valueof<T> = T[keyof T];

export const isIntersected = (r1: Rect, r2: Rect) => {
    return r1.x <= r2.x + r2.w && r1.y <= r2.y + r2.h && r1.x + r1.w >= r2.x && r1.y + r1.h >= r2.y;
};

export const isContained = (parent: Rect, child: Rect) => {
    return parent.x <= child.x
        && parent.y <= child.y
        && parent.x + parent.w >= child.x + child.w
        && parent.y + parent.h >= child.y + child.h;
};

export const expandRect = (r: Rect, margin: number, scale: number = 1): Rect => {
    return {
        x: (r.x - margin) * scale,
        y: (r.y - margin) * scale,
        w: (Math.max(0, r.w + margin * 2)) * scale,
        h: (Math.max(0, r.h + margin * 2)) * scale,
    };
};

export const expandRectToContain = (r: Rect, toBeContained: Rect): Rect => {
    if (r.x > toBeContained.x) r.x = toBeContained.x;
    if (r.y > toBeContained.y) r.y = toBeContained.y;
    if (r.x + r.w < toBeContained.x + toBeContained.w) r.w = toBeContained.x + toBeContained.w - r.x;
    if (r.y + r.h < toBeContained.y + toBeContained.h) r.h = toBeContained.y + toBeContained.h - r.y;
    return r;
};

export const limitRect = (r: Rect, limit: Rect) => {
    // Because limit rect has a padding, when limit right < view width,
    // it will force the view origin change to (-paddingW, -paddingH).
    // The following 2 lines make (0, 0) possible to be view origin. 
    if (r.w > limit.x + limit.w) limit.w = r.w - limit.x;
    if (r.h > limit.y + limit.h) limit.h = r.h - limit.y;

    if (r.x + r.w > limit.x + limit.w)
        r.x = limit.x + limit.w - r.w;
    else if (r.x < limit.x) r.x = limit.x;

    if (r.y + r.h > limit.y + limit.h)
        r.y = limit.y + limit.h - r.h;
    else if (r.y < limit.y) r.y = limit.y;

    return r;
};

export const getPortPosition = (node: Node, type: 'input' | 'output', index: number): Point => {
    return {
        x: node.layout.x + node.layout.w * (index + 1) / (node[type].length + 1),
        y: type === 'input' ? node.layout.y : node.layout.y + node.layout.h,
    };
};

export const getPortDraftPosition = (node: Node, draftLayout: Rect, type: 'input' | 'output', index: number): Point => {
    return {
        x: draftLayout.x + draftLayout.w * (index + 1) / (node[type].length + 1),
        y: type === 'input' ? draftLayout.y : draftLayout.y + draftLayout.h,
    };
};
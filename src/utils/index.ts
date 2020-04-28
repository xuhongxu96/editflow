import { Rect } from "models/BasicTypes";

export type valueof<T> = T[keyof T];

export const isIntersected = (r1: Rect, r2: Rect) => {
    return r1.x <= r2.x + r2.w && r1.y <= r2.y + r2.h && r1.x + r1.w >= r2.x && r1.y + r1.h >= r2.y;
}

export const isContained = (parent: Rect, child: Rect) => {
    return parent.x <= child.x
        && parent.y <= child.y
        && parent.x + parent.w >= child.x + child.w
        && parent.y + parent.h >= child.y + child.h;
}

export const expandRect = (r: Rect, margin: number): Rect => {
    return {
        x: r.x - margin,
        y: r.y - margin,
        w: Math.max(0, r.w + margin * 2),
        h: Math.max(0, r.h + margin * 2),
    };
}

export const expandRectToContain = (r: Rect, toBeContained: Rect): Rect => {
    if (r.x > toBeContained.x) r.x = toBeContained.x;
    if (r.y > toBeContained.y) r.y = toBeContained.y;
    if (r.x + r.w < toBeContained.x + toBeContained.w) r.w = toBeContained.x + toBeContained.w - r.x;
    if (r.y + r.h < toBeContained.y + toBeContained.h) r.h = toBeContained.y + toBeContained.h - r.y;
    return r;
}

export const limitRect = (r: Rect, limit: Rect) => {
    if (r.x + r.w > limit.x + limit.w) {
        if (limit.w < r.w) r.x = Math.max(0, limit.x);
        else r.x = limit.x + limit.w - r.w;
    } else if (r.x < limit.x) r.x = limit.x;

    if (r.y + r.h > limit.y + limit.h) {
        if (limit.h < r.h) r.y = Math.max(0, limit.y);
        else r.y = limit.y + limit.h - r.h;
    } else if (r.y < limit.y) r.y = limit.y;

    return r;
}
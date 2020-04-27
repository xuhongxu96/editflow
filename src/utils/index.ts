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

export const limitRect = (r: Rect, limit: Rect) => {
    if (r.x + r.w > limit.x + limit.w)
        r.x = limit.x + limit.w - r.w;
    if (r.x + r.h > limit.x + limit.h)
        r.x = limit.x + limit.h - r.h;

    if (r.x < limit.x) r.x = limit.x;
    if (r.y < limit.y) r.y = limit.y;

    return r;
}
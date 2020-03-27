import { Rect } from "models/BasicTypes";

export type valueof<T> = T[keyof T];

export const isIntersected = (r1: Rect, r2: Rect) => {
    return r1.x < r2.x + r2.w && r1.y < r2.y + r2.h && r1.x + r1.w > r2.x && r1.y + r1.h > r2.y;
}

export const toMap = function <T, K, V>(array: T[], keySelector: (item: T, index: string) => K, valueSelector: (item: T, index: string) => V) {
    let res = new Map<K, V>();
    for (let i in array) {
        res.set(keySelector(array[i], i), valueSelector(array[i], i));
    }
    return res;
};

export const IndexKeySelector = function <T>(_: T, index: string) { return index };
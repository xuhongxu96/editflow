import * as Basic from "models/BasicTypes";
import { isIntersected, isContained } from "utils";

type LeftOrRight = 'left' | 'right';
type TopOrBottom = 'top' | 'bottom';
type UpOrDown = 'up' | 'down';

export interface Node<T> {
    data: T[];

    bound: Basic.Rect;

    left: {
        top?: Node<T>;
        bottom?: Node<T>;
    };
    right: {
        top?: Node<T>;
        bottom?: Node<T>;
    };
}

function subRect<T>(node: Node<T>, leftOrRight: LeftOrRight, topOrBottom: TopOrBottom): Basic.Rect {
    return {
        x: leftOrRight === 'left' ? node.bound.x : node.bound.x + node.bound.w / 2,
        y: topOrBottom === 'top' ? node.bound.y : node.bound.y + node.bound.h / 2,
        w: node.bound.w / 2,
        h: node.bound.h / 2,
    };
}

function calculateExpandTimes(unit: number, delta: number) {
    let times = 1; for (; unit * 2 < delta; ++times, unit *= 2);
    return times;
}

function insert<T>(root: Node<T>, rect: Basic.Rect, data: T) {
    if (!isIntersected(root.bound, rect)) return;
    root.data.push(data);

    if (root.bound.w <= 60 && root.bound.h <= 60) return;

    for (const leftOrRight of ['left', 'right'] as LeftOrRight[]) {
        for (const topOrBottom of ['top', 'bottom'] as TopOrBottom[]) {
            const subBound = subRect(root, leftOrRight, topOrBottom);

            let currentNode = root[leftOrRight][topOrBottom];
            if (currentNode === undefined) {
                currentNode = {
                    data: [],
                    bound: subBound,
                    left: {},
                    right: {},
                };
                root[leftOrRight][topOrBottom] = currentNode;
            }
            insert(currentNode, rect, data);
        }
    }
}

function isLeaf<T>(node: Node<T>) {
    return !node.left.top && !node.left.bottom && !node.right.top && !node.right.bottom;
}

function getCoveredData<T>(node: Node<T>, cover: Basic.Rect): Set<T> {
    const { bound } = node;

    if (!isIntersected(bound, cover)) return new Set<T>();
    if (isContained(cover, node.bound)) return new Set<T>(node.data);

    const res = new Set<T>();
    for (const leftOrRight of ['left', 'right'] as LeftOrRight[]) {
        for (const topOrBottom of ['top', 'bottom'] as TopOrBottom[]) {
            const currentNode = node[leftOrRight][topOrBottom];
            if (currentNode) {
                getCoveredData(currentNode, cover).forEach(o => res.add(o));
            }
        }
    }

    return res;
}

export class QuadTree<T> {
    init: boolean = false;
    root: Node<T>;

    constructor(w: number, h: number) {
        this.root = {
            data: [],
            bound: { x: 0, y: 0, w: w, h: h },
            left: {}, right: {},
        };
    }

    expand(leftOrRight: LeftOrRight, upOrDown: UpOrDown) {
        const { bound } = this.root;
        const newRoot: Node<T> = {
            data: [...this.root.data],
            bound: {
                x: leftOrRight === 'left' ? bound.x - bound.w : bound.x,
                y: upOrDown === 'up' ? bound.y - bound.h : bound.y,
                w: bound.w * 2,
                h: bound.h * 2,
            },
            left: {
                top: leftOrRight === 'right' && upOrDown === 'down' ? this.root : undefined,
                bottom: leftOrRight === 'right' && upOrDown === 'up' ? this.root : undefined,
            },
            right: {
                top: leftOrRight === 'left' && upOrDown === 'down' ? this.root : undefined,
                bottom: leftOrRight === 'left' && upOrDown === 'up' ? this.root : undefined,
            },
        };
        this.root = newRoot;
    }

    expandTimes(leftOrRight: LeftOrRight, upOrDown: UpOrDown, times: number) {
        for (let i = 0; i < times; ++i) this.expand(leftOrRight, upOrDown);
    }

    insert(rect: Basic.Rect, data: T) {
        const { bound } = this.root;
        let maxFactor = 0;
        let leftOrRight: 'left' | 'right' = 'right';
        if (rect.x < bound.x) {
            leftOrRight = 'left';
            maxFactor = Math.max(maxFactor, calculateExpandTimes(bound.w, bound.x - rect.x));
        } else if (rect.x + rect.w > bound.x + bound.w) {
            leftOrRight = 'right';
            maxFactor = Math.max(maxFactor, calculateExpandTimes(bound.w, rect.x + rect.w - bound.x - bound.w));
        }

        let upOrDown: 'up' | 'down' = 'down';
        if (rect.y < bound.y) {
            upOrDown = 'up';
            maxFactor = Math.max(maxFactor, calculateExpandTimes(bound.h, bound.y - rect.y));
        } else if (rect.y + rect.h > bound.y + bound.h) {
            upOrDown = 'down'
            maxFactor = Math.max(maxFactor, calculateExpandTimes(bound.h, rect.y + rect.h - bound.y - bound.h));
        }

        if (maxFactor > 0) {
            this.expandTimes(leftOrRight, upOrDown, maxFactor);
        }

        insert(this.root, rect, data);
    }

    getCoveredData(cover: Basic.Rect) {
        return Array.from(getCoveredData(this.root, cover));
    }
}
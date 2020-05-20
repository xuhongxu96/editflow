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

function calculateExpandTimes(unit: number, need: number) {
    let times = 1; for (; unit * 2 < need; ++times, unit *= 2);
    return times;
}

function insert<T>(root: Node<T>, rect: Basic.Rect, data: T, resolution: number) {
    // Not intersected means the node's children cannot contain it either
    if (!isIntersected(root.bound, rect)) return;
    root.data.push(data);

    // If current node's bound size is smaller than resolution, skip children
    if (root.bound.w <= resolution && root.bound.h <= resolution) return;

    for (const leftOrRight of ['left', 'right'] as LeftOrRight[]) {
        for (const topOrBottom of ['top', 'bottom'] as TopOrBottom[]) {
            let currentNode = root[leftOrRight][topOrBottom];
            if (currentNode === undefined) {
                currentNode = {
                    data: [],
                    bound: subRect(root, leftOrRight, topOrBottom),
                    left: {},
                    right: {},
                };
                root[leftOrRight][topOrBottom] = currentNode;
            }
            insert(currentNode, rect, data, resolution);
        }
    }
}

function remove<T>(root: Node<T>, rect: Basic.Rect, data: T, resolution: number) {
    if (!isIntersected(root.bound, rect)) return;
    root.data.splice(root.data.indexOf(data), 1);

    if (root.bound.w <= resolution && root.bound.h <= resolution) return;

    for (const leftOrRight of ['left', 'right'] as LeftOrRight[]) {
        for (const topOrBottom of ['top', 'bottom'] as TopOrBottom[]) {
            let currentNode = root[leftOrRight][topOrBottom];
            if (currentNode) remove(currentNode, rect, data, resolution);
        }
    }
}

function getCoveredData<T>(node: Node<T>, cover: Basic.Rect, resolution: number): Set<T> {
    const { bound } = node;

    if (!isIntersected(bound, cover)) return new Set<T>();
    if (isContained(cover, node.bound) || (bound.w <= resolution && bound.h <= resolution))
        return new Set<T>(node.data);

    const res = new Set<T>();
    for (const leftOrRight of ['left', 'right'] as LeftOrRight[]) {
        for (const topOrBottom of ['top', 'bottom'] as TopOrBottom[]) {
            const currentNode = node[leftOrRight][topOrBottom];
            if (currentNode) getCoveredData(currentNode, cover, resolution).forEach(o => res.add(o));
        }
    }

    return res;
}

export class QuadTree<T> {
    root: Node<T>;
    resolution: number;

    constructor(w: number, h: number, resolution: number = 60) {
        this.root = {
            data: [],
            bound: { x: 0, y: 0, w: w, h: h },
            left: {}, right: {},
        };
        this.resolution = resolution;
    }

    clear() {
        this.root.data = [];
        this.root.left = {};
        this.root.right = {};
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
            maxFactor = Math.max(maxFactor, calculateExpandTimes(bound.w, bound.x - rect.x + bound.w));
        } else if (rect.x + rect.w > bound.x + bound.w) {
            leftOrRight = 'right';
            maxFactor = Math.max(maxFactor, calculateExpandTimes(bound.w, rect.x + rect.w - bound.x));
        }

        let upOrDown: 'up' | 'down' = 'down';
        if (rect.y < bound.y) {
            upOrDown = 'up';
            maxFactor = Math.max(maxFactor, calculateExpandTimes(bound.h, bound.y - rect.y + bound.h));
        } else if (rect.y + rect.h > bound.y + bound.h) {
            upOrDown = 'down'
            maxFactor = Math.max(maxFactor, calculateExpandTimes(bound.h, rect.y + rect.h - bound.y));
        }

        if (maxFactor > 0) {
            this.expandTimes(leftOrRight, upOrDown, maxFactor);
        }

        insert(this.root, rect, data, this.resolution);
    }

    remove(rect: Basic.Rect, data: T) {
        remove(this.root, rect, data, this.resolution);
    }

    getCoveredData(cover: Basic.Rect) {
        return Array.from(getCoveredData(this.root, cover, this.resolution));
    }

    getRootBound() {
        return this.root.bound;
    }
}
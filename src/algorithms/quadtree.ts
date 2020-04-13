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
        x: leftOrRight === 'left' ? node.bound.x : node.bound.x + node.bound.w >> 1,
        y: topOrBottom === 'top' ? node.bound.y : node.bound.y + node.bound.h >> 1,
        w: node.bound.w >> 1,
        h: node.bound.h >> 1,
    };
}

function calculateExpandTimes(unit: number, delta: number) {
    let times = 1; for (; (unit <<= 1) > delta; ++times);
    return times;
}

function insert<T>(node: Node<T>, pos: Basic.Point, data: T) {
    node.data.push(data);

    const { bound } = node;
    if (bound.w <= 1 && bound.h <= 1) {
        return;
    }

    const leftOrRight = (pos.x < bound.x + bound.w >> 1) ? 'left' : 'right';
    const topOrBottom = (pos.y < bound.y + bound.h >> 1) ? 'top' : 'bottom';

    const subNode = node[leftOrRight][topOrBottom] ?? {
        data: [],
        bound: subRect(node, leftOrRight, topOrBottom),
        left: {}, right: {},
    };
    insert(subNode, pos, data);
    node[leftOrRight][topOrBottom] = subNode;
}

function getCoveredData<T>(node: Node<T>, cover: Basic.Rect): T[][] {
    const { bound } = node;
    if (!isIntersected(bound, cover)) return [];

    let res = [];

    for (const leftOrRight of ['left', 'right'] as LeftOrRight[]) {
        for (const topOrBottom of ['top', 'bottom'] as TopOrBottom[]) {
            const currentNode = node[leftOrRight][topOrBottom];
            if (currentNode) {
                const currentRect = subRect(node, 'left', 'top');
                if (isContained(cover, currentRect)) {
                    res.push(currentNode.data);
                } else if (isIntersected(cover, currentRect)) {
                    res.push(...getCoveredData(currentNode, cover));
                }
            }
        }
    }

    return res;
}

export class QuadTree<T> {
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
            data: this.root.data,
            bound: {
                x: leftOrRight === 'left' ? bound.x - bound.w : bound.x,
                y: upOrDown === 'up' ? bound.y - bound.h : bound.y,
                w: bound.w << 1,
                h: bound.h << 1,
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

    insert(pos: Basic.Point, data: T) {
        const { bound } = this.root;
        let maxFactor = 0;
        let leftOrRight: 'left' | 'right' = 'right';
        if (pos.x < bound.x) {
            leftOrRight = 'left';
            maxFactor = Math.max(maxFactor, calculateExpandTimes(bound.w, bound.x - pos.x));
        } else if (pos.x > bound.x + bound.w) {
            leftOrRight = 'right';
            maxFactor = Math.max(maxFactor, calculateExpandTimes(bound.w, pos.x - bound.x - bound.w));
        }

        let upOrDown: 'up' | 'down' = 'down';
        if (pos.y < bound.y) {
            upOrDown = 'up';
            maxFactor = Math.max(maxFactor, calculateExpandTimes(bound.h, bound.y - pos.y));
        } else if (pos.y > bound.y + bound.h) {
            upOrDown = 'down'
            maxFactor = Math.max(maxFactor, calculateExpandTimes(bound.h, pos.y - bound.y - bound.h));
        }

        if (maxFactor > 0) {
            this.expandTimes(leftOrRight, upOrDown, maxFactor);
        }

        insert(this.root, pos, data);
    }

    getCoveredData(cover: Basic.Rect) {
        return getCoveredData(this.root, cover);
    }
}
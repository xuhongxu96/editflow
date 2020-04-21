import { QuadTree } from "./quadtree";

test('test QuadTree', () => {
    const tree = new QuadTree<number>(10, 10);
    // TODO: Add tests
    /*
    tree.insert({ x: 1, y: 1, w: }, 0);
    tree.insert({ x: 1, y: 9 }, 1);
    tree.insert({ x: 9, y: 1 }, 2);
    tree.insert({ x: 9, y: 9 }, 3);
    tree.insert({ x: 9, y: 6 }, 4);
    expect(tree.root.data.length).toBe(5);

    expect(tree.getCoveredData({ x: 1, y: 2, w: 3, h: 3 })).toStrictEqual([]);
    expect(tree.getCoveredData({ x: 1, y: 1, w: 3, h: 3 })).toStrictEqual([0]);
    expect(tree.getCoveredData({ x: 2, y: 1, w: 8, h: 3 })).toStrictEqual([2]);
    expect(tree.getCoveredData({ x: 1, y: 1, w: 8, h: 3 })).toStrictEqual([0, 2]);
    expect(tree.getCoveredData({ x: 0, y: 5, w: 10, h: 4 })).toStrictEqual([1, 4, 3]);
    expect(tree.getCoveredData({ x: 0, y: 5, w: 10, h: 5 })).toStrictEqual([1, 3, 4]);
    expect(tree.getCoveredData({ x: 0, y: 0, w: 10, h: 10 })).toStrictEqual([0, 1, 2, 3, 4]);
    */
});
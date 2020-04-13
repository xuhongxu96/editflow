import { QuadTree } from "./quadtree";

test('test QuadTree', () => {
    const tree = new QuadTree<number>(10, 10);
    tree.insert({ x: 1, y: 1 }, 0);
    tree.insert({ x: 1, y: 9 }, 1);
    tree.insert({ x: 9, y: 1 }, 2);
    tree.insert({ x: 9, y: 9 }, 3);
    expect(tree.root.data.length).toBe(4);
    // TODO: more tests
});
import { QuadTree } from './quadtree';

test('expand', () => {
  const tree = new QuadTree<number>(10, 10, 1);
  tree.insert({ x: 1, y: 1, w: 20, h: 20 }, 0);
  expect(tree.root.bound).toStrictEqual({ x: 0, y: 0, w: 40, h: 40 });
});

test('get covered data (resolution = default/60)', () => {
  const tree = new QuadTree<number>(10, 10);
  tree.insert({ x: 1, y: 1, w: 20, h: 20 }, 0);
  tree.insert({ x: 10, y: 10, w: 10, h: 10 }, 1);

  expect(tree.getCoveredData({ x: 0, y: 0, w: 1, h: 1 })).toStrictEqual([0, 1]);
});

test('get covered data (resolution = 1)', () => {
  const tree = new QuadTree<number>(10, 10, 1);
  tree.insert({ x: 1, y: 1, w: 20, h: 20 }, 0);
  tree.insert({ x: 10, y: 10, w: 10, h: 10 }, 1);

  expect(tree.getCoveredData({ x: 0, y: 0, w: 1, h: 1 })).toStrictEqual([0]);
});

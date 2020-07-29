import { Node } from './Flow';

export interface NodeTemplate extends Omit<Node, 'layout'> {}

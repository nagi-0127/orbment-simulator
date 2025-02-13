import { solve } from 'yalps';
import type { Model } from 'yalps';

const worker: Worker = self as any;

worker.onmessage = (event: MessageEvent<Model>) => {
  const result = solve(event.data);
  self.postMessage(result);
}

export default worker;

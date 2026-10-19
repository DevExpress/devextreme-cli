import { expect } from 'vitest';
import { toMatchImageSnapshot } from './utils/image-snapshot.mjs';

expect.extend({ toMatchImageSnapshot });

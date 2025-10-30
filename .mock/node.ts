import { setupServer } from 'msw/node';

import { handlers } from './handlers';
import fetchPolyfill, { Request as RequestPolyfill } from 'node-fetch';

Object.defineProperty(global, 'fetch', {
  writable: true, // MSW or similar might overwrite this for interception
  value: fetchPolyfill,
});

Object.defineProperty(global, 'Request', {
  writable: false,
  value: RequestPolyfill,
});

export const server = setupServer(...handlers);

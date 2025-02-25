import { setupServer } from 'msw/node';

// @ts-ignore
import { handlers } from './handlers';

export const server = setupServer(...handlers);

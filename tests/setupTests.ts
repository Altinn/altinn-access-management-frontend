import { expect, beforeAll, afterEach, afterAll } from 'vitest';
import '@testing-library/jest-dom';
import * as matchers from '@testing-library/jest-dom/matchers';

import { server } from '@mock/node';

import { TEST_BASE_URL, TEST_PARTY_ID, TEST_PARTY_UUID } from './consts';

expect.extend(matchers);

import.meta.env.BASE_URL = TEST_BASE_URL;

// Workaround for the known issue. For more info, see this: https://github.com/jsdom/jsdom/issues/3294#issuecomment-1268330372
HTMLDialogElement.prototype.showModal = function mock(this: HTMLDialogElement) {
  this.open = true;
};
HTMLDialogElement.prototype.close = function mock(this: HTMLDialogElement) {
  this.open = false;
};

// document.getAnimations must be mocked because it is used by the design system, but it is not supported by React Testing Library.
Object.defineProperty(document, 'getAnimations', {
  value: () => [],
  writable: true,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

beforeAll(() => server.listen());
beforeEach(() => {
  document.cookie = `AltinnPartyId=${TEST_PARTY_ID};`;
  document.cookie = `AltinnPartyUuid=${TEST_PARTY_UUID};`;
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

import { expect } from 'vitest';
import '@testing-library/jest-dom';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Workaround for the known issue. For more info, see this: https://github.com/jsdom/jsdom/issues/3294#issuecomment-1268330372
HTMLDialogElement.prototype.showModal = function mock(this: HTMLDialogElement) {
  this.open = true;
};
HTMLDialogElement.prototype.close = function mock(this: HTMLDialogElement) {
  this.open = false;
};

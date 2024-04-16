/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Delays the execution of a function by a specified amount of time.
 *
 * @param {(...args: any[]) => void} func - The function to delay.
 * @param {number} [timeout=300] - The amount of time in milliseconds to delay the function call.
 * @returns {Function} A new function that delays the invocation of the input function.
 *
 * @example
 * debounce(() => display('Hello, world!'), 500);
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export function debounce(func: (...args: any[]) => void, timeout = 300) {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, timeout);
  };
}

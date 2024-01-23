/**
 * Delays the execution of a function by a specified amount of time.
 *
 * @param {(...args: any[]) => void} func - The function to delay.
 * @param {number} [timeout=300] - The amount of time in milliseconds to delay the function call.
 * @returns {Function} A new function that delays the invocation of the input function.
 *
 * @example
 * debounce(() => console.log('Hello, world!'), 500);
 */
export function debounce(func: (...args: any[]) => void, timeout = 300) {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, timeout);
  };
}

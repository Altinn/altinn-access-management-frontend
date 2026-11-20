import { describe, expect, test } from 'vitest';

import { arraysEqual } from './arrayUtils';

describe('arraysEqual', () => {
  test('Returns true if arrays are the same', () => {
    const array = [1, 2, 3];
    expect(arraysEqual(array, array)).toBe(true);
  });

  test('Returns true if arrays have equal content', () => {
    expect(arraysEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(arraysEqual(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(true);
    expect(arraysEqual([true, false], [true, false])).toBe(true);
    expect(arraysEqual([1, 'b', true], [1, 'b', true])).toBe(true);
  });

  test('Returns true if both arrays are undefined', () => {
    expect(arraysEqual(undefined, undefined)).toBe(true);
  });

  test('Returns false if one of the arrays is undefined', () => {
    expect(arraysEqual([1, 2, 3], undefined)).toBe(false);
    expect(arraysEqual(undefined, [1, 2, 3])).toBe(false);
  });

  test('Returns false if the arrays have different length', () => {
    expect(arraysEqual([1, 2, 3], [1, 2, 3, 4])).toBe(false);
    expect(arraysEqual([1, 2, 3, 4], [1, 2, 3])).toBe(false);
  });

  test('Returns false if the arrays have different order', () => {
    expect(arraysEqual([1, 2, 3], [1, 3, 2])).toBe(false);
    expect(arraysEqual([3, 2, 1], [2, 3, 1])).toBe(false);
    expect(arraysEqual(['a', 'b', 'c'], ['c', 'a', 'b'])).toBe(false);
    expect(arraysEqual([true, false], [false, true])).toBe(false);
  });

  test('Returns false if the arrays have different content', () => {
    expect(arraysEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    expect(arraysEqual<string | number>([1, 2, 3], ['a', 'b', 'c'])).toBe(false);
    expect(arraysEqual<string | number>([1, 2, 3], ['1', '2', '3'])).toBe(false);
    expect(arraysEqual(['a', 'b', 'c'], ['å', 'b', 'c'])).toBe(false);
    expect(arraysEqual([true, false], [true, true])).toBe(false);
    expect(arraysEqual([1, 'b', true], [0, 'b', true])).toBe(false);
  });
});

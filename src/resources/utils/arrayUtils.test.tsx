import { describe, expect, test } from 'vitest';

import { arraysEqual, getArrayPage, getTotalNumOfPages } from './arrayUtils';

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

describe('getArrayPage', () => {
  const sampleArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const sampleArray2 = ['a', 'b', 'c'];

  test('returns correct page for valid input', () => {
    expect(getArrayPage(sampleArray, 1, 3)).toEqual([1, 2, 3]);
    expect(getArrayPage(sampleArray, 2, 3)).toEqual([4, 5, 6]);
    expect(getArrayPage(sampleArray, 3, 3)).toEqual([7, 8, 9]);
    expect(getArrayPage(sampleArray, 4, 3)).toEqual([10]);

    expect(getArrayPage(sampleArray, 1, 6)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(getArrayPage(sampleArray, 2, 6)).toEqual([7, 8, 9, 10]);

    expect(getArrayPage(sampleArray, 1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getArrayPage(sampleArray, 2, 5)).toEqual([6, 7, 8, 9, 10]);

    expect(getArrayPage(sampleArray2, 2, 2)).toEqual(['c']);

    expect(getArrayPage([], 1, 2)).toEqual([]);
  });

  test('throws error for invalid page number', () => {
    expect(() => getArrayPage(sampleArray, 0, 3)).toThrow('Invalid page number');
    expect(() => getArrayPage(sampleArray, -4, 3)).toThrow('Invalid page number');
  });

  test('throws error for invalid numPerPage', () => {
    expect(() => getArrayPage(sampleArray, 1, 0)).toThrow('numPerPage must be greater than 0');
    expect(() => getArrayPage(sampleArray, 1, -2)).toThrow('numPerPage must be greater than 0');
  });
});

describe('getTotalNumberOfPages', () => {
  const sampleArray1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const sampleArray2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  const sampleArray3 = ['a', 'b', 'c'];

  test('returns correct number of pages', () => {
    expect(getTotalNumOfPages(sampleArray1, 5)).toBe(2);
    expect(getTotalNumOfPages(sampleArray1, 3)).toBe(4);
    expect(getTotalNumOfPages(sampleArray1, 10)).toBe(1);
    expect(getTotalNumOfPages(sampleArray1, 1)).toBe(10);

    expect(getTotalNumOfPages(sampleArray2, 5)).toBe(3);
    expect(getTotalNumOfPages(sampleArray2, 10)).toBe(2);

    expect(getTotalNumOfPages(sampleArray3, 2)).toBe(2);

    expect(getTotalNumOfPages([], 2)).toBe(1); // Empty array only has a single (empty) page
  });

  test('throws error for invalid numPerPage', () => {
    expect(() => getTotalNumOfPages(sampleArray1, 0)).to.throw('numPerPage must be greater than 0');
    expect(() => getTotalNumOfPages(sampleArray1, -2)).to.throw(
      'numPerPage must be greater than 0',
    );
  });
});

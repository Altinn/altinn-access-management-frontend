import { arraysEqual, getArrayPage, getTotalNumOfPages } from './arrayUtils';

describe('arrayUtils', () => {
  describe('arraysEqual', () => {
    it('Returns true if arrays are the same', () => {
      const array = [1, 2, 3];
      expect(arraysEqual(array, array)).to.equal(true);
    });

    it('Returns true if arrays have equal content', () => {
      expect(arraysEqual([1, 2, 3], [1, 2, 3])).to.equal(true);
      expect(arraysEqual(['a', 'b', 'c'], ['a', 'b', 'c'])).to.equal(true);
      expect(arraysEqual([true, false], [true, false])).to.equal(true);
      expect(arraysEqual([1, 'b', true], [1, 'b', true])).to.equal(true);
    });

    it('Returns true if both arrays are undefined', () => {
      expect(arraysEqual(undefined, undefined)).to.equal(true);
    });

    it('Returns false if one of the arrays is undefined', () => {
      expect(arraysEqual([1, 2, 3], undefined)).to.equal(false);
      expect(arraysEqual(undefined, [1, 2, 3])).to.equal(false);
    });

    it('Returns false if the arrays have different length', () => {
      expect(arraysEqual([1, 2, 3], [1, 2, 3, 4])).to.equal(false);
      expect(arraysEqual([1, 2, 3, 4], [1, 2, 3])).to.equal(false);
    });

    it('Returns false if the arrays have different order', () => {
      expect(arraysEqual([1, 2, 3], [1, 3, 2])).to.equal(false);
      expect(arraysEqual([3, 2, 1], [2, 3, 1])).to.equal(false);
      expect(arraysEqual(['a', 'b', 'c'], ['c', 'a', 'b'])).to.equal(false);
      expect(arraysEqual([true, false], [false, true])).to.equal(false);
    });

    it('Returns false if the arrays have different content', () => {
      expect(arraysEqual([1, 2, 3], [1, 2, 4])).to.equal(false);
      expect(arraysEqual<string | number>([1, 2, 3], ['a', 'b', 'c'])).to.equal(false);
      expect(arraysEqual<string | number>([1, 2, 3], ['1', '2', '3'])).to.equal(false);
      expect(arraysEqual(['a', 'b', 'c'], ['å', 'b', 'c'])).to.equal(false);
      expect(arraysEqual([true, false], [true, true])).to.equal(false);
      expect(arraysEqual([1, 'b', true], [0, 'b', true])).to.equal(false);
    });
  });

  describe('getArrayPage', () => {
    const sampleArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const sampleArray2 = ['a', 'b', 'c'];

    it('returns correct page for valid input', () => {
      expect(getArrayPage(sampleArray, 1, 3)).to.equal([1, 2, 3]);
      expect(getArrayPage(sampleArray, 2, 3)).to.equal([4, 5, 6]);
      expect(getArrayPage(sampleArray, 3, 3)).to.equal([7, 8, 9]);
      expect(getArrayPage(sampleArray, 4, 3)).to.equal([10]);

      expect(getArrayPage(sampleArray, 1, 6)).to.equal([1, 2, 3, 4, 5, 6]);
      expect(getArrayPage(sampleArray, 2, 6)).to.equal([7, 8, 9, 10]);

      expect(getArrayPage(sampleArray, 1, 5)).to.equal([1, 2, 3, 4, 5]);
      expect(getArrayPage(sampleArray, 2, 5)).to.equal([6, 7, 8, 9, 10]);

      expect(getArrayPage(sampleArray2, 2, 2)).to.equal(['c']);
    });

    it('throws error for invalid page number', () => {
      expect(() => getArrayPage(sampleArray, 0, 3)).to.throw('Invalid page number');
      expect(() => getArrayPage(sampleArray, 4, 3)).to.throw('Invalid page number');
    });

    it('throws error for invalid numPerPage', () => {
      expect(() => getArrayPage(sampleArray, 1, 0)).to.throw('numPerPage must be greater than 0');
      expect(() => getArrayPage(sampleArray, 1, -2)).to.throw('numPerPage must be greater than 0');
    });
  });

  describe('getTotalNumberOfPages', () => {
    const sampleArray1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const sampleArray2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    const sampleArray3 = ['a', 'b', 'c'];

    it('returns correct number of pages', () => {
      expect(getTotalNumOfPages(sampleArray1, 5)).to.equal(2);
      expect(getTotalNumOfPages(sampleArray1, 3)).to.equal(4);
      expect(getTotalNumOfPages(sampleArray1, 10)).to.equal(1);
      expect(getTotalNumOfPages(sampleArray1, 1)).to.equal(10);

      expect(getTotalNumOfPages(sampleArray2, 5)).to.equal(3);
      expect(getTotalNumOfPages(sampleArray2, 10)).to.equal(2);

      expect(getTotalNumOfPages(sampleArray3, 2)).to.equal(2);
    });

    it('throws error for invalid numPerPage', () => {
      expect(() => getTotalNumOfPages(sampleArray1, 0)).to.throw(
        'numPerPage must be greater than 0',
      );
      expect(() => getTotalNumOfPages(sampleArray1, -2)).to.throw(
        'numPerPage must be greater than 0',
      );
    });
  });
});

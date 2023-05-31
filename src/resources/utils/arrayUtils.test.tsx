import { arraysEqual } from './arrayUtils';

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
});

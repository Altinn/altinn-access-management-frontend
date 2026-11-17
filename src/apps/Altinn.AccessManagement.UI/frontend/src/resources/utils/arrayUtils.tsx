/**
 * Checks if the content of two arrays is equal.
 * @param array1 The first array to compare.
 * @param array2 The second array to compare.
 * @returns `true` if the arrays have the same content, `false` otherwise.
 */
export function arraysEqual<T>(array1?: T[], array2?: T[]): boolean {
  if (array1 === array2) return true;
  if (array1 === undefined || array2 === undefined) return false;
  if (array1.length !== array2.length) return false;
  for (const [i] of array1.entries()) {
    if (array1[i] !== array2[i]) return false;
  }
  return true;
}

/**
 * Checks if the content of two arrays is equal, where the order of the content is irrelevant.
 * @param array1 The first array to compare.
 * @param array2 The second array to compare.
 * @returns `true` if the arrays have the same content (but not nessecarily in the same spaces), `false` otherwise.
 */
export function arraysEqualUnordered<T>(arr1: T[], arr2: T[]) {
  if (arr1.length !== arr2.length) return false;
  const countMap = new Map<T, number>();

  for (const item of arr1) {
    countMap.set(item, (countMap.get(item) || 0) + 1);
  }

  for (const item of arr2) {
    const count = countMap.get(item);
    if (count === undefined) return false;
    if (count === 1) {
      countMap.delete(item);
    } else {
      countMap.set(item, count - 1);
    }
  }

  return countMap.size === 0;
}

/**
 * Paginates an array, returning the array elements pertaining to the given page.
 * @param array The array to be paginated.
 * @param page The page number of the returned elements. (Indexation starts at 1)
 * @param numPerPage Number of elements on each page.
 * @returns The elements present on the given page.
 * @throws {RangeError} Thrown when either numPerPage or page is not valid (e.g., asking for a page that does not exist).
 */
export function getArrayPage<T>(array: T[], page: number, numPerPage: number): T[] {
  if (numPerPage <= 0) {
    throw new RangeError('numPerPage must be greater than 0');
  }

  if (page <= 0 || page > getTotalNumOfPages(array, numPerPage)) {
    throw new RangeError('Invalid page number');
  }

  const pageStartIndex = (page - 1) * numPerPage;
  const endIndex = Math.min(pageStartIndex + numPerPage, array.length);

  return array.slice(pageStartIndex, endIndex);
}

/**
 * Calculates the total number of pages needed to paginate an array.
 * @param array The array to be paginated.
 * @param numPerPage Number of elements on each page.
 * @returns The total number of pages.
 */
export function getTotalNumOfPages<T>(array: T[], numPerPage: number): number {
  if (numPerPage <= 0) {
    throw new RangeError('numPerPage must be greater than 0');
  }

  if (!array || array.length === 0) {
    return 1;
  }

  return Math.ceil(array.length / numPerPage);
}

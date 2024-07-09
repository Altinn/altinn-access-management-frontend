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

  if (page <= 0 || page > Math.ceil(array.length / numPerPage)) {
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
  return Math.ceil(array.length / numPerPage);
}

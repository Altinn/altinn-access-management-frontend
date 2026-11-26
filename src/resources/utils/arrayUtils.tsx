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

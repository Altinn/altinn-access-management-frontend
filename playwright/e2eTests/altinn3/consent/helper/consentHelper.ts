/**
 * Extract consent request ID from view URI
 */
export function getConsentRequestId(viewUri: string): string {
  const id = new URL(viewUri).searchParams.get('id');
  if (!id) throw new Error('Could not extract consent request ID from viewUri');
  return id;
}

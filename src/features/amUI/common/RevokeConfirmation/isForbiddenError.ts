/**
 * Whether a request was refused with 403. A delegation check answers 403 when the logged in user
 * cannot act for the party at all, so unlike other failures it is a definite "cannot delegate".
 */
export const isForbiddenError = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && 'status' in error && error.status === 403;

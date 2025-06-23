import { useState } from 'react';

import type { DelegationErrorDetails } from './useDelegateAccessPackage';

/** A standardized error for any type of delegation, request, or revoking action */
export type ActionError = {
  /** The http status received with the error */
  httpStatus: string;
  /** When the error happened */
  timestamp: string;
  /** Additional information if available */
  details?: DelegationErrorDetails;
};

/** Use state for the ActionError type */
export const useActionError = (initValue?: ActionError) => {
  const [error, setError] = useState<ActionError | null>(initValue ?? null);
  const isError = error !== null;

  return { isError, error, setError };
};

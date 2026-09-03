import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { createErrorDetails } from '../../TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import type { TechnicalErrorDetails } from '../DelegationRightsPanel';

/**
 * A rights-meta query that failed, or succeeded with no rights at all, leaves the panel with
 * nothing to render — both are surfaced to the user as a technical error.
 */
export const getRightsMetaErrorDetails = ({
  isError,
  isEmpty,
  error,
}: {
  isError: boolean;
  isEmpty: boolean;
  error?: FetchBaseQueryError | SerializedError;
}): TechnicalErrorDetails | null => {
  if (!isError && !isEmpty) {
    return null;
  }

  const details = createErrorDetails(error);
  return {
    status: details?.status ?? (isEmpty ? 'empty response' : 'no status'),
    time: details?.time ?? new Date().toISOString(),
    traceId: details?.traceId,
  };
};

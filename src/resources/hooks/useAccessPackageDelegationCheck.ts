import { useEffect } from 'react';

import { useDelegationCheckQuery } from '@/rtk/features/accessPackageApi';

import type { ActionError } from './useActionError';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

/**
 * Custom hook to check delegation status for access packages.
 *
 * @param {string[]} accessPackageIds - Array of access package IDs to check.
 * @param {boolean} shouldShowDelegationCheck - Flag to determine if the delegation check should be performed.
 * @param {function} handleDelegationCheckFailure - Callback function to handle delegation check failure.
 * @returns {function} - Function to check if a specific package ID can be delegated.
 */
export const useAccessPackageDelegationCheck = (
  accessPackageIds: string[],
  shouldShowDelegationCheck: boolean,
  handleDelegationCheckFailure: (error: ActionError) => void,
) => {
  const { displayLimitedPreviewLaunch } = window.featureFlags;

  const { isLoading, data, isUninitialized, error } = useDelegationCheckQuery(
    { packageIds: accessPackageIds },
    { skip: accessPackageIds.length > 0 && shouldShowDelegationCheck },
  );
  useEffect(() => {
    if (error) {
      handleDelegationCheckFailure({
        httpStatus: (error as FetchBaseQueryError)?.status?.toString() ?? '500',
        details: (error as FetchBaseQueryError)?.data ?? {},
        timestamp: new Date().toISOString(),
      });
    }
  }, [error]);

  /**
   * Function to check if a specific package ID can be delegated.
   *
   * @param {string} id - The package ID to check.
   * @returns {boolean} - True if the package can be delegated, false otherwise.
   */
  const canDelegate = (id: string) =>
    displayLimitedPreviewLaunch
      ? true
      : !!(!isLoading && data?.find((d) => d.packageId === id)?.canDelegate);

  return { canDelegate, isLoading, isUninitialized };
};

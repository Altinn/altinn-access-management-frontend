import { useDelegationCheckMutation } from '@/rtk/features/accessPackageApi';
import { useEffect } from 'react';
import { ActionError } from './useActionError';

/**
 * Custom hook to check delegation status for access packages.
 *
 * @param {string[]} accessPackageIds - Array of access package IDs to check.
 * @param {boolean} shouldShowDelegationCheck - Flag to determine if the delegation check should be performed.
 * @param {function} handleDelegationCheckFailure - Callback function to handle delegation check failure.
 * @returns {function} - Function to check if a specific package ID can be delegated.
 */
export const useDelegationCheck = (
  accessPackageIds: string[],
  shouldShowDelegationCheck: boolean,
  handleDelegationCheckFailure: (error: ActionError) => void,
) => {
  const [delegationCheck, { isLoading, data }] = useDelegationCheckMutation();

  useEffect(() => {
    if (accessPackageIds.length > 0 && shouldShowDelegationCheck) {
      delegationCheck({ packageIds: accessPackageIds })
        .unwrap()
        .catch((response) => {
          handleDelegationCheckFailure({
            httpStatus: response.status,
            timestamp: new Date().toISOString(),
          });
        });
    }
  }, [accessPackageIds, shouldShowDelegationCheck]);

  /**
   * Function to check if a specific package ID can be delegated.
   *
   * @param {string} id - The package ID to check.
   * @returns {boolean} - True if the package can be delegated, false otherwise.
   */
  const canDelegate = (id: string) =>
    !isLoading && data?.find((d) => d.packageId === id)?.canDelegate;

  return canDelegate;
};

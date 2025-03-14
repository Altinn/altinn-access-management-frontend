import { useDelegationCheckMutation } from '@/rtk/features/accessPackageApi';
import { useEffect } from 'react';

export const useDelegationCheck = (
  accessPackageIds: string[],
  shouldShowDelegationCheck: boolean,
) => {
  const [delegationCheck, { isLoading, data }] = useDelegationCheckMutation();

  useEffect(() => {
    if (accessPackageIds.length > 0 && shouldShowDelegationCheck) {
      delegationCheck({ packageIds: accessPackageIds });
    }
  }, [accessPackageIds, shouldShowDelegationCheck]);

  const canDelegate = (id: string) =>
    !isLoading && data?.find((d) => d.packageId === id)?.canDelegate;

  return canDelegate;
};

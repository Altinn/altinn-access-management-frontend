import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import { useDelegatePackageMutation } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookupApi';

export const useDelegateAccessPackage = () => {
  const [delegate, { isLoading }] = useDelegatePackageMutation();

  const delegatePackage = (
    toParty: Party,
    resource: AccessPackage,
    onSuccess?: () => void,
    onError?: (status: string | number) => void,
  ) => {
    delegate({ to: toParty.partyUuid, packageId: resource.id })
      .unwrap()
      .then(() => {
        onSuccess?.();
      })
      .catch((response) => {
        onError?.(response.status);
      });
  };

  return { delegatePackage, isLoading };
};

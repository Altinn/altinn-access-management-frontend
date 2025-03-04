import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import { useRevokeDelegationMutation } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookupApi';

export const useRevokeAccessPackage = () => {
  const [revoke] = useRevokeDelegationMutation();

  const delegatePackage = (
    toParty: Party,
    resource: AccessPackage,
    onSuccess?: () => void,
    onError?: (status: string | number) => void,
  ) => {
    revoke({ to: toParty.partyUuid, packageId: resource.id })
      .unwrap()
      .then(() => {
        onSuccess?.();
      })
      .catch((response) => {
        onError?.(response.status);
      });
  };

  return delegatePackage;
};

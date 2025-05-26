import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import { useRevokeDelegationMutation } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookupApi';

export const useRevokeAccessPackage = () => {
  const [revoke, { isLoading }] = useRevokeDelegationMutation();

  const revokePackage = (
    toParty: Party,
    fromParty: Party,
    actingParty: Party,
    resource: AccessPackage,
    onSuccess?: () => void,
    onError?: (status: string | number) => void,
  ) => {
    revoke({
      to: toParty.partyUuid,
      packageId: resource.id,
      from: fromParty.partyUuid,
      party: actingParty.partyUuid,
    })
      .unwrap()
      .then(() => {
        onSuccess?.();
      })
      .catch((response) => {
        onError?.(response.status);
      });
  };

  return { revokePackage, isLoading };
};

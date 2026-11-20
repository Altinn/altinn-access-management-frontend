import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import { useRevokeDelegationMutation } from '@/rtk/features/accessPackageApi';
import type { PartyEntity } from '@/dataObjects/dtos/Party';

export const useRevokeAccessPackage = () => {
  const [revoke, { isLoading }] = useRevokeDelegationMutation();

  const revokePackage = (
    toParty: PartyEntity,
    fromParty: PartyEntity,
    actingParty: PartyEntity,
    resource: AccessPackage,
    onSuccess?: () => void,
    onError?: (status: string | number) => void,
  ) => {
    revoke({
      to: toParty.id,
      packageId: resource.id,
      from: fromParty.id,
      party: actingParty.id,
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

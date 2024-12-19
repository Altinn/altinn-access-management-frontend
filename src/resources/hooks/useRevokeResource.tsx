import type { Party } from '@/rtk/features/lookupApi';
import { useRevokeResourceMutation } from '@/rtk/features/singleRights/singleRightsApi';

export const useRevokeResource = () => {
  const [revoke] = useRevokeResourceMutation();

  const revokeResource = (
    resourceId: string,
    fromParty: Party,
    toParty: Party,
    onSuccess?: () => void,
    onError?: () => void,
  ) => {
    const from = fromParty.partyUuid;
    const to = toParty.partyUuid;

    revoke({
      from,
      to,
      resourceId,
    })
      .unwrap()
      .then(() => {
        onSuccess?.();
      })
      .catch((error) => {
        console.log(error);
        onError?.();
      });
  };

  return revokeResource;
};

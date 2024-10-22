import type { Party } from '@/rtk/features/lookup/lookupApi';
import { useRevokeResourceMutation } from '@/rtk/features/singleRights/singleRightsApi';

import { getUrnForParty } from '../utils';

export const useRevokeResource = () => {
  const [revoke] = useRevokeResourceMutation();

  const revokeResource = (
    resourceId: string,
    fromParty: Party,
    toParty: Party,
    onSuccess?: () => void,
    onError?: () => void,
  ) => {
    const from = getUrnForParty(fromParty.partyUuid, fromParty.partyTypeName);
    const to = getUrnForParty(toParty.partyUuid, toParty.partyTypeName);

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

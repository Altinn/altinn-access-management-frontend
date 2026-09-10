import {
  useLazyDelegationCheckQuery,
  useLazyGetResourceRightsQuery,
} from '@/rtk/features/singleRights/singleRightsApi';
import { useGetIsHovedadminQuery } from '@/rtk/features/userInfoApi';

import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';

export const useCanRedelegateResource = () => {
  const { actingParty, fromParty, toParty, selfParty } = usePartyRepresentation();
  const { data: isHovedadmin } = useGetIsHovedadminQuery();
  const [runDelegationCheck] = useLazyDelegationCheckQuery();
  const [getResourceRights] = useLazyGetResourceRightsQuery();

  const canRedelegateResource = async (resourceId: string): Promise<boolean> => {
    if (!actingParty || !fromParty || !toParty) return false;
    // If the user is deleting their own access and is not hovedadmin, show the warning regardless
    // of the delegation check: the check passes only because they still hold the access.
    if (toParty.partyUuid === selfParty?.partyUuid) return !!isHovedadmin;
    const check = runDelegationCheck({ resourceId, from: fromParty.partyUuid });
    const rights = getResourceRights({
      actingParty: actingParty.partyUuid,
      from: fromParty.partyUuid,
      to: toParty.partyUuid,
      resourceId,
    });
    try {
      const [checkedRights, heldRights] = await Promise.all([check.unwrap(), rights.unwrap()]);
      return heldRights.directRights.every((held) =>
        checkedRights.some((checked) => checked.right.key === held.right.key && checked.result),
      );
    } catch {
      return false;
    } finally {
      check.unsubscribe();
      rights.unsubscribe();
    }
  };

  return { canRedelegateResource };
};

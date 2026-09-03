import {
  useLazyDelegationCheckQuery,
  useLazyGetResourceRightsQuery,
} from '@/rtk/features/singleRights/singleRightsApi';

import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';

import { isForbiddenError } from './isForbiddenError';

/**
 * Whether the logged in user can give every right the recipient holds on a resource back again
 * after deleting it. Run on demand rather than per row. Unknown answers count as yes, except 403.
 */
export const useCanRedelegateResource = () => {
  const { actingParty, fromParty, toParty } = usePartyRepresentation();
  const [runDelegationCheck] = useLazyDelegationCheckQuery();
  const [getResourceRights] = useLazyGetResourceRightsQuery();

  const canRedelegateResource = async (resourceId: string): Promise<boolean> => {
    if (!actingParty || !fromParty || !toParty) return true;
    const check = runDelegationCheck({ resourceId, from: fromParty.partyUuid }, true);
    const rights = getResourceRights(
      {
        actingParty: actingParty.partyUuid,
        from: fromParty.partyUuid,
        to: toParty.partyUuid,
        resourceId,
      },
      true,
    );
    try {
      const [checkedRights, heldRights] = await Promise.all([check.unwrap(), rights.unwrap()]);
      return heldRights.directRights.every((held) =>
        checkedRights.some((checked) => checked.right.key === held.right.key && checked.result),
      );
    } catch (error) {
      return !isForbiddenError(error);
    } finally {
      check.unsubscribe();
      rights.unsubscribe();
    }
  };

  return { canRedelegateResource };
};

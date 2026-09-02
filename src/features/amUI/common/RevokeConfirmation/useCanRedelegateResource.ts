import {
  useLazyDelegationCheckQuery,
  useLazyGetResourceRightsQuery,
} from '@/rtk/features/singleRights/singleRightsApi';

import { canRedelegateRights } from '../DelegationModal/utils/rightsUtils';
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
    try {
      const [checkedRights, heldRights] = await Promise.all([
        runDelegationCheck({ resourceId, from: fromParty.partyUuid }, true).unwrap(),
        getResourceRights(
          {
            actingParty: actingParty.partyUuid,
            from: fromParty.partyUuid,
            to: toParty.partyUuid,
            resourceId,
          },
          true,
        ).unwrap(),
      ]);
      return canRedelegateRights(
        heldRights.directRights.map((held) => held.right.key),
        checkedRights,
      );
    } catch (error) {
      return !isForbiddenError(error);
    }
  };

  return { canRedelegateResource };
};

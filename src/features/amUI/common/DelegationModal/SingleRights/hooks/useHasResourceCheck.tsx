import { useGetSingleRightsForRightholderQuery } from '@/rtk/features/singleRights/singleRightsApi';
import { usePartyRepresentation } from '../../../PartyRepresentationContext/PartyRepresentationContext';

export const useHasResourceCheck = (resourceId: string) => {
  const { toParty, fromParty, actingParty } = usePartyRepresentation();
  const { data: resourcesWithAccess } = useGetSingleRightsForRightholderQuery(
    {
      actingParty: actingParty?.partyUuid || '',
      from: fromParty?.partyUuid || '',
      to: toParty?.partyUuid || '',
    },
    { skip: !toParty || !fromParty || !actingParty },
  );
  return resourcesWithAccess
    ? resourcesWithAccess.some((r) => r.resource.identifier === resourceId)
    : false;
};

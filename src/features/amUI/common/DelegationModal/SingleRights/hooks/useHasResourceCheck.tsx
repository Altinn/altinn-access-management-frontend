import { usePartyRepresentation } from '../../../PartyRepresentationContext/PartyRepresentationContext';

import { useGetSingleRightsForRightholderQuery } from '@/rtk/features/singleRights/singleRightsApi';

export const useHasResourceCheck = (resourceId: string) => {
  const { toParty, fromParty, actingParty } = usePartyRepresentation();
  const { data: resourcesWithAccess, isLoading } = useGetSingleRightsForRightholderQuery(
    {
      actingParty: actingParty?.partyUuid || '',
      from: fromParty?.partyUuid || '',
      to: toParty?.partyUuid || '',
    },
    { skip: !toParty || !fromParty || !actingParty },
  );
  const hasResourceAccess = resourcesWithAccess
    ? resourcesWithAccess.some((r) => r.resource.identifier === resourceId)
    : false;

  return {
    hasResourceAccess,
    isLoading,
  };
};

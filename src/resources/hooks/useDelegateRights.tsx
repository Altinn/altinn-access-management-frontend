import { useDelegateRightsMutation } from '@/rtk/features/singleRights/singleRightsApi';
import type { DelegationResult } from '@/dataObjects/dtos/resourceDelegation';
import { usePartyRepresentation } from '@/features/amUI/common/PartyRepresentationContext/PartyRepresentationContext';

export const useDelegateRights = () => {
  const [delegate] = useDelegateRightsMutation();
  const { toParty, fromParty, actingParty } = usePartyRepresentation();

  const delegateRights = (
    actionKeys: string[],
    resourceId: string,
    onSuccess?: () => void,
    onError?: (status: string | number) => void,
  ) => {
    if (!toParty || !fromParty || !actingParty) {
      console.error('Missing party information for delegation.');
      return;
    }

    delegate({
      partyUuid: actingParty.partyUuid,
      fromUuid: fromParty.partyUuid,
      toUuid: toParty.partyUuid,
      resourceId: resourceId,
      actionKeys: actionKeys,
    })
      .unwrap()
      .then(() => {
        onSuccess?.();
      })
      .catch((status) => {
        onError?.(status);
      });
  };

  return delegateRights;
};

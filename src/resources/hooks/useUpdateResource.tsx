import { useUpdateResourceMutation } from '@/rtk/features/singleRights/singleRightsApi';
import { usePartyRepresentation } from '@/features/amUI/common/PartyRepresentationContext/PartyRepresentationContext';

export const useUpdateResource = () => {
  const [update] = useUpdateResourceMutation();
  const { toParty, fromParty, actingParty } = usePartyRepresentation();

  const updateResource = (
    resourceId: string,
    actionKeys: string[],
    onSuccess?: () => void,
    onError?: () => void,
  ) => {
    if (!toParty || !fromParty || !actingParty) {
      console.error('Missing party information for delegation.');
      return;
    }

    update({
      party: actingParty!.partyUuid,
      from: fromParty!.partyUuid,
      to: toParty!.partyUuid,
      resourceId,
      actionKeys,
    })
      .unwrap()
      .then((failedEdits) => {
        onSuccess?.();
      })
      .catch((error) => {
        console.log(error);
        onError?.();
      });
  };

  return updateResource;
};

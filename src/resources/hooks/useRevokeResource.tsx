import { usePartyRepresentation } from '@/features/amUI/common/PartyRepresentationContext/PartyRepresentationContext';
import { useRevokeResourceMutation } from '@/rtk/features/singleRights/singleRightsApi';

export const useRevokeResource = () => {
  const [revoke] = useRevokeResourceMutation();
  const { actingParty, toParty, fromParty } = usePartyRepresentation();

  const revokeResource = (resourceId: string, onSuccess?: () => void, onError?: () => void) => {
    revoke({
      from: fromParty?.partyUuid || '',
      to: toParty?.partyUuid || '',
      party: actingParty?.partyUuid || '',
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

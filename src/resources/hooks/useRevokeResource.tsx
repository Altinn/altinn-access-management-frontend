import { useRevokeResourceMutation } from '@/rtk/features/singleRights/singleRightsApi';

export const useRevokeResource = () => {
  const [revoke] = useRevokeResourceMutation();

  const revokeResource = (
    resourceId: string,
    fromPartyUuid: string,
    toPartyUuid: string,
    onSuccess?: () => void,
    onError?: () => void,
  ) => {
    const from = fromPartyUuid;
    const to = toPartyUuid;

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

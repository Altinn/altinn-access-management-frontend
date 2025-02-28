import { useEditResourceMutation } from '@/rtk/features/singleRights/singleRightsApi';
import type { RightChangesDto } from '@/dataObjects/dtos/resourceDelegation';

export const useEditResource = () => {
  const [edit] = useEditResourceMutation();

  const editResource = (
    resourceId: string,
    fromPartyUuid: string,
    toPartyUuid: string,
    prevRightKeys: string[],
    newRightKeys: string[],
    onSuccess?: () => void,
    onError?: () => void,
  ) => {
    const rightsToAdd = newRightKeys.filter((rk) => !prevRightKeys.includes(rk));
    const rightsToDelete = prevRightKeys.filter((rk) => !newRightKeys.includes(rk));
    const edits: RightChangesDto = {
      RightsToDelegate: rightsToAdd,
      RightsToRevoke: rightsToDelete,
    };

    edit({
      from: fromPartyUuid,
      to: toPartyUuid,
      resourceId,
      edits,
    })
      .unwrap()
      .then((failedEdits) => {
        if (failedEdits.length > 0) {
          onError?.();
        } else {
          onSuccess?.();
        }
      })
      .catch((error) => {
        console.log(error);
        onError?.();
      });
  };

  return editResource;
};

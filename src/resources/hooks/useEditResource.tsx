import type { Party } from '@/rtk/features/lookupApi';
import { useEditResourceMutation } from '@/rtk/features/singleRights/singleRightsApi';
import type { RightChangesDto } from '@/dataObjects/dtos/resourceDelegation';

export const useEditResource = () => {
  const [edit] = useEditResourceMutation();

  const editResource = (
    resourceId: string,
    fromParty: Party,
    toParty: Party,
    prevRightKeys: string[],
    newRightKeys: string[],
    onSuccess?: () => void,
    onError?: () => void,
  ) => {
    const from = fromParty.partyUuid;
    const to = toParty.partyUuid;

    const rightsToAdd = newRightKeys.filter((rk) => !prevRightKeys.includes(rk));
    const rightsToDelete = prevRightKeys.filter((rk) => !newRightKeys.includes(rk));
    const edits: RightChangesDto = {
      RightsToDelegate: rightsToAdd,
      RightsToRevoke: rightsToDelete,
    };

    edit({
      from,
      to,
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

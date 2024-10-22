import type { Party } from '@/rtk/features/lookup/lookupApi';
import { useEditResourceMutation } from '@/rtk/features/singleRights/singleRightsApi';
import type { RightChangesDto } from '@/dataObjects/dtos/resourceDelegation';

import { getUrnForParty } from '../utils';

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
    const from = getUrnForParty(fromParty.partyUuid, fromParty.partyTypeName);
    const to = getUrnForParty(toParty.partyUuid, toParty.partyTypeName);

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
      .then(() => {
        onSuccess?.();
      })
      .catch((error) => {
        console.log(error);
        onError?.();
      });
  };

  return editResource;
};

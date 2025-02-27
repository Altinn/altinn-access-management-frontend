import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { useDelegateRightsMutation } from '@/rtk/features/singleRights/singleRightsApi';
import type { ChipRight } from '@/features/amUI/common/DelegationModal/SingleRights/ResourceInfo';
import type { DelegationResult } from '@/dataObjects/dtos/resourceDelegation';

export const useDelegateRights = () => {
  const [delegate] = useDelegateRightsMutation();

  const delegateRights = (
    rights: ChipRight[],
    toPartyUuid: string,
    resource: ServiceResource,
    onSuccess?: (response: DelegationResult) => void,
    onError?: (status: string | number) => void,
  ) => {
    delegate({
      toUuid: toPartyUuid,
      resourceId: resource.identifier,
      rightKeys: rights.map((r) => r.rightKey),
    })
      .unwrap()
      .then((response) => {
        onSuccess?.(response);
      })
      .catch((status) => {
        onError?.(status);
      });
  };

  return delegateRights;
};

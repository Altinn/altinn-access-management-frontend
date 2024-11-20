import { IdValuePair } from '@/dataObjects/dtos/IdValuePair';
import type { DelegationInputDto, DelegationResult } from '@/dataObjects/dtos/resourceDelegation';
import { DelegationRequestDto, ServiceDto } from '@/dataObjects/dtos/resourceDelegation';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { useDelegateRightsMutation } from '@/rtk/features/singleRights/singleRightsApi';
import { PartyType } from '@/rtk/features/userInfoApi';
import type { ChipRight } from '@/features/amUI/userRightsPage/DelegationModal/SingleRights/ResourceInfo';
import type { Party } from '@/rtk/features/lookupApi';

export const useDelegateRights = () => {
  const [delegate] = useDelegateRightsMutation();

  const delegateRights = (
    rights: ChipRight[],
    toParty: Party,
    resource: ServiceResource,
    onSuccess?: (response: DelegationResult) => void,
    onError?: (status: string | number) => void,
  ) => {
    let recipient: IdValuePair[];
    if (toParty && toParty.partyTypeName === PartyType.Person) {
      recipient = [new IdValuePair('urn:altinn:person:uuid', toParty.partyUuid)];
    } else if (toParty && toParty.partyTypeName === PartyType.Organization) {
      recipient = [new IdValuePair('urn:altinn:organization:uuid', toParty.partyUuid)];
    } else if (toParty && toParty.partyTypeName === PartyType.SelfIdentified) {
      recipient = [new IdValuePair('urn:altinn:enterpriseuser:uuid', toParty.partyUuid)];
    } else {
      throw new Error('Cannot delegate. User type not defined');
    }

    const rightsToDelegate = rights.map(
      (r) => new DelegationRequestDto(r.resourceReference, r.action),
    );

    if (resource && rightsToDelegate.length > 0) {
      const delegationInput: DelegationInputDto = {
        To: recipient,
        Rights: rightsToDelegate,
        serviceDto: new ServiceDto(
          resource.title,
          resource.resourceOwnerName,
          resource.resourceType,
        ),
      };

      delegate(delegationInput)
        .unwrap()
        .then((response) => {
          onSuccess?.(response);
        })
        .catch((status) => {
          onError?.(status);
        });
    }
  };

  return delegateRights;
};

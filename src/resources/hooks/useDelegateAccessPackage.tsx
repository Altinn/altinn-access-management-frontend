import type { AccessPackage, DelegationInput } from '@/rtk/features/accessPackageApi';
import { useDelegatePackageMutation } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookupApi';
import { PartyType } from '@/rtk/features/userInfoApi';
import { IdValuePair } from '@/dataObjects/dtos/IdValuePair';

export const useDelegateAccessPackage = () => {
  const [delegate] = useDelegatePackageMutation();

  const delegatePackage = (
    toParty: Party,
    resource: AccessPackage,
    onSuccess?: () => void,
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

    const delegationInput: DelegationInput = {
      to: recipient,
      rights: [
        {
          resource: [{ id: 'urn:altinn:accesspackage', value: resource.id }],
        },
      ],
    };

    delegate(delegationInput)
      .unwrap()
      .then(() => {
        onSuccess?.();
      })
      .catch((status) => {
        onError?.(status);
      });
  };

  return delegatePackage;
};

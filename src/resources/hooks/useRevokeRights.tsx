import { IdValuePair } from '@/dataObjects/dtos/IdValuePair';
import type { RevokeDelegationDto } from '@/dataObjects/dtos/resourceDelegation';
import { DelegationType } from '@/features/apiDelegation/components/DelegationType';
import type { Party } from '@/rtk/features/lookup/lookupApi';
import { useRevokeRightsMutation } from '@/rtk/features/singleRights/singleRightsApi';
import { PartyType } from '@/rtk/features/userInfo/userInfoApi';

import { getCookie } from '../Cookie/CookieMethods';

export const useRevokeRights = () => {
  const [revoke] = useRevokeRightsMutation();

  const delegateRights = (
    rightkeys: string[],
    toParty: Party,
    onSuccess?: () => void,
    onError?: () => void,
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

    if (rightkeys.length > 0) {
      const revokeInput: RevokeDelegationDto = {
        To: recipient,
        Rightkeys: rightkeys,
      };

      revoke({
        type: DelegationType.Offered,
        party: getCookie('AltinnPartyId'),
        delegationToRevoke: revokeInput,
      })
        .then(() => {
          onSuccess?.();
        })
        .catch(() => {
          onError?.();
        });
    }
  };

  return delegateRights;
};

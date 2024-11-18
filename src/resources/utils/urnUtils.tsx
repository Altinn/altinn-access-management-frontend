import { PartyType } from '@/rtk/features/userInfoApi';

export const getUrnForParty = (partyUuid: string, partyType: PartyType) => {
  if (partyUuid && partyType === PartyType.Person) {
    return `urn:altinn:person:uuid:${partyUuid}`;
  } else if (partyUuid && partyType === PartyType.Organization) {
    return `urn:altinn:organization:uuid:${partyUuid}`;
  } else if (partyUuid && partyType === PartyType.SelfIdentified) {
    return `urn:altinn:enterpriseuser:uuid:${partyUuid}`;
  } else {
    throw new Error('Cannot delegate. User type not defined');
  }
};

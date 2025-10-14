import { Party } from '@/rtk/features/lookupApi';
import { PartyType, User } from '@/rtk/features/userInfoApi';

export const mapConnectionToParty = (party: User | undefined): Party | undefined => {
  if (!party) return undefined;
  console.log('🪵 ~ mapConnectionToParty ~ party.type:', party.type);
  return {
    partyId: Number.parseInt(party.id) ?? 0,
    name: party.name,
    unitType: party.type,
    orgNumber: party.keyValues?.OrganizationIdentifier,
    partyUuid: party.id,
    partyTypeName:
      party.type?.toLocaleLowerCase() === 'organisasjon'
        ? PartyType.Organization
        : PartyType.Person,
  };
};

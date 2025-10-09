import { Party } from '@/rtk/features/lookupApi';
import { User } from '@/rtk/features/userInfoApi';

export const mapConnectionToParty = (party: User | undefined): Party | undefined => {
  if (!party) return undefined;
  return {
    partyId: Number.parseInt(party.id),
    name: party.name,
    unitType: party.type,
    orgNumber: party.keyValues?.OrganizationIdentifier,
    partyUuid: party.id,
    partyTypeName: party.type as any,
  };
};

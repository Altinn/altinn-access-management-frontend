import { Party } from '@/rtk/features/lookupApi';
import { PartyType, User } from '@/rtk/features/userInfoApi';

export const mapConnectionToParty = (party: User | undefined): Party | undefined => {
  if (!party) return undefined;
  const partyId =
    typeof party.partyId === 'string' ? Number.parseInt(party.partyId) : party.partyId;
  return {
    partyId: partyId ?? 0,
    name: party.name,
    unitType: party.type,
    orgNumber: party.organizationIdentifier ?? undefined,
    partyUuid: party.id,
    partyTypeName:
      party.type?.toLocaleLowerCase() === 'organisasjon'
        ? PartyType.Organization
        : PartyType.Person,
    variant: party.variant,
  };
};

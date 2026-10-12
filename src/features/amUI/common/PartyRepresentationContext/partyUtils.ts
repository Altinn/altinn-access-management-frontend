import { PartyEntityType, type PartyEntity } from '@/dataObjects/dtos/Party';
import { type Party } from '@/rtk/features/lookupApi';
import { PartyType } from '@/rtk/features/userInfoApi';

type MappablePartyEntity = Pick<
  PartyEntity,
  'id' | 'name' | 'type' | 'unitType' | 'organizationIdentifier' | 'dateOfBirth'
> &
  Partial<Pick<PartyEntity, 'partyId' | 'isDeleted'>>;

/**
 * Converts a PartyEntity (or a user search target) to the lookup Party used by PartyRepresentationContext.
 * Remove when the lookup endpoints return PartyEntity.
 */
export function mapPartyEntityToParty(party: MappablePartyEntity): Party;
export function mapPartyEntityToParty(party: MappablePartyEntity | undefined): Party | undefined;
export function mapPartyEntityToParty(party: MappablePartyEntity | undefined): Party | undefined {
  if (!party) return undefined;
  return {
    partyId: party.partyId ?? 0,
    partyUuid: party.id,
    name: party.name,
    unitType: party.unitType ?? undefined,
    orgNumber: party.organizationIdentifier ?? undefined,
    dateOfBirth: party.dateOfBirth ?? undefined,
    isDeleted: party.isDeleted,
    partyTypeName:
      party.type === PartyEntityType.Organization
        ? PartyType.Organization
        : party.type === PartyEntityType.SystemUser
          ? PartyType.Systemuser
          : PartyType.Person,
  };
}

/**
 * Converts a lookup Party to a PartyEntity.
 * Remove when the lookup endpoints return PartyEntity.
 */
export const mapPartyToPartyEntity = (party: Party): PartyEntity => ({
  id: party.partyUuid,
  partyId: party.partyId,
  name: party.name,
  type:
    party.partyTypeName === PartyType.Organization || party.partyTypeName === PartyType.SubUnit
      ? PartyEntityType.Organization
      : party.partyTypeName === PartyType.Systemuser
        ? PartyEntityType.SystemUser
        : party.partyTypeName === PartyType.SelfIdentified
          ? PartyEntityType.SelfIdentified
          : PartyEntityType.Person,
  unitType: party.unitType,
  organizationIdentifier: party.orgNumber,
  dateOfBirth: party.dateOfBirth,
  isDeleted: party.isDeleted ?? false,
  children: null,
});

import type { Entity } from '@/dataObjects/dtos/Common';
import { PartyEntityType, type PartyEntity } from '@/dataObjects/dtos/Party';

import { isNewUser } from '../isNewUser';

import type { UserSearchNode } from './types';

/**
 * Converts the party type strings of endpoints the BFF does not map yet (permissions, client
 * delegations, Maskinporten). Remove once those return PartyEntity.
 */
export const toPartyEntityType = (type?: string | null): PartyEntityType => {
  switch (type?.toLowerCase()) {
    case 'organization':
    case 'organisasjon':
      return PartyEntityType.Organization;
    case 'systemuser':
    case 'systembruker':
      return PartyEntityType.SystemUser;
    default:
      return PartyEntityType.Person;
  }
};

export const buildSortKey = (name: string, sortKey?: string, addedAt?: string) =>
  `${isNewUser(addedAt) ? '0' : '1'}:${sortKey ?? name}`;

type NodeOptions = Partial<Pick<UserSearchNode, 'sortKey' | 'addedAt' | 'isInherited'>>;

export const mapPartyToUserSearchNode = (
  party: PartyEntity,
  { sortKey, addedAt, isInherited }: NodeOptions = {},
): UserSearchNode => ({
  id: party.id,
  name: party.name,
  type: party.type,
  unitType: party.unitType,
  organizationIdentifier: party.organizationIdentifier,
  dateOfBirth: party.dateOfBirth,
  isDeleted: party.isDeleted,
  sortKey: buildSortKey(party.name, sortKey, addedAt),
  addedAt,
  isInherited,
  roles: [],
  children: party.children?.map((child) => mapPartyToUserSearchNode(child)) ?? null,
});

/** Maps an Entity from an endpoint the BFF does not map to PartyEntity yet. */
export const mapEntityToUserSearchNode = (
  entity: Entity,
  { sortKey, addedAt, isInherited }: NodeOptions = {},
): UserSearchNode => {
  const type = toPartyEntityType(entity.type);
  return {
    id: entity.id,
    name: entity.name,
    type,
    unitType: type === PartyEntityType.Organization ? entity.variant : null,
    organizationIdentifier: entity.organizationIdentifier,
    dateOfBirth: entity.dateOfBirth,
    isDeleted: entity.isDeleted ?? undefined,
    sortKey: buildSortKey(entity.name, sortKey, addedAt),
    addedAt,
    isInherited,
    roles: [],
    children: null,
  };
};

export const addRole = (node: UserSearchNode, id: string, code: string, viaParty?: Entity) => {
  const hasRole = node.roles.some((role) => role.code === code);

  if (!hasRole) {
    node.roles.push(viaParty ? { id, code, viaParty } : { id, code });
  }
};

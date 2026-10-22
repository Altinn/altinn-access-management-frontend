import type { PartyEntity } from '@/dataObjects/dtos/Party';

import { isNewUser } from '../isNewUser';

import type { UserSearchNode } from './types';

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

export const addRole = (
  node: UserSearchNode,
  id: string,
  code: string,
  viaParty?: PartyEntity | null,
) => {
  const hasRole = node.roles.some((role) => role.code === code);

  if (!hasRole) {
    node.roles.push(viaParty ? { id, code, viaParty } : { id, code });
  }
};

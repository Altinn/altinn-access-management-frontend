import type { Entity } from '@/dataObjects/dtos/Common';
import { ConnectionUserType } from '@/rtk/features/connectionApi';

import { isNewUser } from '../isNewUser';

import type { UserSearchNode } from './types';

export const normalizeType = (type?: string) => {
  if (!type) {
    return type;
  }
  const normalized = type.toLowerCase();

  if (normalized === 'person') {
    return ConnectionUserType.Person;
  }
  if (normalized === 'organization' || normalized === 'organisasjon') {
    return ConnectionUserType.Organization;
  }
  if (normalized === 'systemuser' || normalized === 'systembruker') {
    return ConnectionUserType.Systemuser;
  }
  return type;
};

export const buildSortKey = (name: string, sortKey?: string, addedAt?: string) =>
  `${isNewUser(addedAt) ? '0' : '1'}:${sortKey ?? name}`;

export const addRole = (node: UserSearchNode, id: string, code: string, viaParty?: Entity) => {
  const hasRole = node.roles.some((role) => role.code === code);

  if (!hasRole) {
    node.roles.push(viaParty ? { id, code, viaParty } : { id, code });
  }
};

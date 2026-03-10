import type { Permissions } from '@/dataObjects/dtos/accessPackage';
import type { Entity } from '@/dataObjects/dtos/Common';
import { ConnectionUserType, type Connection } from '@/rtk/features/connectionApi';
import type { ExtendedUser, User } from '@/rtk/features/userInfoApi';

import { isNewUser } from '../isNewUser';

import type { UserSearchNode } from './types';

type UserLike = User | ExtendedUser | UserSearchNode;

const normalizeType = (type?: string) => {
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

const buildSortKey = (name: string, sortKey?: string, addedAt?: string) =>
  `${isNewUser(addedAt) ? '0' : '1'}:${sortKey ?? name}`;

const mapUserToUserSearchNode = (user: UserLike): UserSearchNode => ({
  id: user.id,
  name: user.name,
  type: normalizeType(user.type),
  variant: user.variant,
  partyId: user.partyId,
  organizationIdentifier: user.organizationIdentifier,
  dateOfBirth: user.dateOfBirth,
  sortKey: buildSortKey(user.name, user.sortKey, user.addedAt),
  addedAt: user.addedAt,
  isDeleted: user.isDeleted ?? undefined,
  isInherited: 'isInherited' in user ? user.isInherited : undefined,
  matchInChildren: 'matchInChildren' in user ? user.matchInChildren : undefined,
  roles: 'roles' in user && Array.isArray(user.roles) ? user.roles : [],
  children: user.children?.map(mapUserToUserSearchNode) ?? null,
});

const mapEntityToUserSearchNode = (entity: Entity, isInherited: boolean): UserSearchNode => ({
  id: entity.id,
  name: entity.name,
  type: normalizeType(entity.type),
  variant: entity.variant,
  partyId: entity.partyId,
  organizationIdentifier: entity.organizationIdentifier,
  dateOfBirth: entity.dateOfBirth,
  sortKey: buildSortKey(entity.name),
  roles: [],
  children: null,
  isInherited,
});

const addRole = (node: UserSearchNode, id: string, code: string, viaParty?: Entity) => {
  const hasRole = node.roles.some((role) => role.code === code);

  if (!hasRole) {
    node.roles.push(viaParty ? { id, code, viaParty } : { id, code });
  }
};

export const mapConnectionsToUserSearchNodes = (connections?: Connection[]): UserSearchNode[] =>
  connections?.map((connection) => ({
    ...mapUserToUserSearchNode(connection.party),
    sortKey: buildSortKey(
      connection.party.name,
      connection.sortKey ?? connection.party.sortKey,
      connection.party.addedAt,
    ),
    roles: connection.roles,
    children: connection.connections?.length
      ? mapConnectionsToUserSearchNodes(connection.connections)
      : (connection.party.children?.map(mapUserToUserSearchNode) ?? null),
  })) ?? [];

export const mapPermissionsToUserSearchNodes = (
  permissions?: Permissions[],
  { toPartyUuid = '', fromPartyUuid = '' }: { toPartyUuid?: string; fromPartyUuid?: string } = {},
): UserSearchNode[] => {
  if (!permissions?.length) {
    return [];
  }

  const nodes: UserSearchNode[] = [];
  const sortedPermissions = [...permissions].sort((a, b) => {
    if ((a.via || a.viaRole) && !(b.via || b.viaRole)) return -1;
    if ((b.via || b.viaRole) && !(a.via || a.viaRole)) return 1;
    return 0;
  });

  const isInherited = ({ to, from, role, via, viaRole }: Permissions) => {
    if (toPartyUuid !== to.id && fromPartyUuid !== from.id) {
      return true;
    }

    if (role && role.code !== 'rettighetshaver') {
      return true;
    }

    if (via || viaRole) {
      return true;
    }

    return false;
  };

  const getOrCreateRootNode = (entity: Entity, inherited: boolean) => {
    const existingNode = nodes.find((node) => node.id === entity.id);

    if (existingNode) {
      existingNode.isInherited = existingNode.isInherited || inherited;
      return existingNode;
    }

    const newNode = mapEntityToUserSearchNode(entity, inherited);
    nodes.push(newNode);
    return newNode;
  };

  const getOrCreateChildNode = (parent: UserSearchNode, entity: Entity, inherited: boolean) => {
    const children = parent.children ?? [];
    const existingChild = children.find((child) => child.id === entity.id);

    if (existingChild) {
      existingChild.isInherited = existingChild.isInherited || inherited;
      return existingChild;
    }

    const newChild = mapEntityToUserSearchNode(entity, inherited);
    parent.children = [newChild, ...children];
    return newChild;
  };

  for (const permission of sortedPermissions) {
    const inherited = isInherited(permission);

    if (permission.via) {
      const parent = getOrCreateRootNode(permission.via, false);
      const child = getOrCreateChildNode(parent, permission.to, inherited);

      if (permission.viaRole) {
        addRole(child, permission.viaRole.id, permission.viaRole.code, permission.via);
      }

      continue;
    }

    const root = getOrCreateRootNode(permission.to, inherited);

    if (permission.role) {
      addRole(root, permission.role.id, permission.role.code);
    }

    if ((root.children?.length ?? 0) > 0 && permission.role) {
      const child = getOrCreateChildNode(root, permission.to, inherited);
      addRole(child, permission.role.id, permission.role.code);
    }
  }

  return nodes;
};

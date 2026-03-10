import type { Permissions } from '@/dataObjects/dtos/accessPackage';
import type { Entity } from '@/dataObjects/dtos/Common';
import { ConnectionUserType, type Connection } from '@/rtk/features/connectionApi';
import type { ExtendedUser, User } from '@/rtk/features/userInfoApi';

import { isNewUser } from '../isNewUser';

import type { UserSearchNode } from './types';

interface PermissionMapperOptions {
  toPartyUuid?: string;
  fromPartyUuid?: string;
}

type SearchUserLike = Pick<
  User,
  | 'id'
  | 'name'
  | 'type'
  | 'variant'
  | 'partyId'
  | 'organizationIdentifier'
  | 'dateOfBirth'
  | 'sortKey'
  | 'addedAt'
  | 'isDeleted'
> & {
  children: (ExtendedUser | User)[] | UserSearchNode[] | null;
  roles?: Connection['roles'];
  isInherited?: boolean;
};

const buildSortKey = ({
  sortKey,
  name,
  addedAt,
}: Pick<SearchUserLike, 'sortKey' | 'name' | 'addedAt'>) =>
  `${isNewUser(addedAt) ? '0' : '1'}:${sortKey ?? name}`;

export const normalizeUserSearchType = (type?: string) => {
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

export const isInheritedPermission = (
  permission: Pick<Permissions, 'to' | 'from' | 'role' | 'via' | 'viaRole'>,
  toPartyUuid: string,
  fromPartyUuid: string,
) => {
  if (toPartyUuid !== permission.to.id && fromPartyUuid !== permission.from.id) {
    return true;
  }

  if (permission.role && permission.role.code !== 'rettighetshaver') {
    return true;
  }

  if (permission.via || permission.viaRole) {
    return true;
  }

  return false;
};

export const mapUsersToUserSearchNodes = (
  users?: (User | ExtendedUser | UserSearchNode)[] | null,
): UserSearchNode[] =>
  users?.map((user) => ({
    id: user.id,
    name: user.name,
    type: normalizeUserSearchType(user.type),
    variant: user.variant,
    partyId: user.partyId,
    organizationIdentifier: user.organizationIdentifier,
    dateOfBirth: user.dateOfBirth,
    sortKey: buildSortKey({
      sortKey: user.sortKey,
      name: user.name,
      addedAt: user.addedAt,
    }),
    addedAt: user.addedAt,
    isDeleted: user.isDeleted,
    isInherited: 'isInherited' in user ? user.isInherited : undefined,
    matchInChildren: 'matchInChildren' in user ? user.matchInChildren : undefined,
    roles: ('roles' in user && Array.isArray(user.roles) ? user.roles : []) ?? [],
    children: mapUsersToUserSearchNodes(user.children),
  })) ?? [];

export const mapConnectionsToUserSearchNodes = (connections?: Connection[]): UserSearchNode[] =>
  connections?.map((connection) => ({
    id: connection.party.id,
    name: connection.party.name,
    type: normalizeUserSearchType(connection.party.type),
    variant: connection.party.variant,
    partyId: connection.party.partyId,
    organizationIdentifier: connection.party.organizationIdentifier,
    dateOfBirth: connection.party.dateOfBirth,
    sortKey: buildSortKey({
      sortKey: connection.sortKey ?? connection.party.sortKey,
      name: connection.party.name,
      addedAt: connection.party.addedAt,
    }),
    addedAt: connection.party.addedAt,
    isDeleted: connection.party.isDeleted,
    isInherited: connection.party.isInherited,
    roles: connection.roles,
    children: connection.connections?.length
      ? mapConnectionsToUserSearchNodes(connection.connections)
      : mapUsersToUserSearchNodes(connection.party.children),
  })) ?? [];

const createNodeFromEntity = (entity: Entity, inherited: boolean): UserSearchNode => ({
  id: entity.id,
  name: entity.name,
  type: normalizeUserSearchType(entity.type),
  variant: entity.variant,
  partyId: entity.partyId,
  organizationIdentifier: entity.organizationIdentifier,
  dateOfBirth: entity.dateOfBirth,
  sortKey: buildSortKey({ name: entity.name }),
  roles: [],
  children: null,
  isInherited: inherited,
});

const ensurePermissionNode = (
  group: Record<string, UserSearchNode>,
  entity: Entity,
  inherited: boolean,
) => {
  if (!group[entity.id]) {
    group[entity.id] = createNodeFromEntity(entity, inherited);
  } else {
    group[entity.id] = {
      ...group[entity.id],
      isInherited: group[entity.id].isInherited || inherited,
    };
  }

  return group[entity.id];
};

const ensurePermissionChildNode = (
  parent: UserSearchNode,
  entity: Entity,
  inherited: boolean,
): UserSearchNode => {
  const children = parent.children ?? [];
  const child = children.find((node) => node.id === entity.id);

  if (!child) {
    const newChild = createNodeFromEntity(entity, inherited);
    parent.children = [newChild, ...children];
    return newChild;
  }

  const updatedChild = {
    ...child,
    isInherited: child.isInherited || inherited,
  };

  parent.children = children.map((node) => (node.id === entity.id ? updatedChild : node));
  return updatedChild;
};

const addRole = (node: UserSearchNode, id: string, code: string, viaParty?: Entity) => {
  if (!node.roles.some((role) => role.code === code)) {
    node.roles.push(viaParty ? { id, code, viaParty } : { id, code });
  }
};

export const mapPermissionsToUserSearchNodes = (
  permissions?: Permissions[],
  { toPartyUuid = '', fromPartyUuid = '' }: PermissionMapperOptions = {},
): UserSearchNode[] => {
  if (!permissions?.length) {
    return [];
  }

  const group: Record<string, UserSearchNode> = {};
  const sortedPermissions = [...permissions].sort((a, b) => {
    if ((a.via || a.viaRole) && !(b.via || b.viaRole)) return -1;
    if ((b.via || b.viaRole) && !(a.via || a.viaRole)) return 1;
    return 0;
  });

  for (const { to, from, role, via, viaRole } of sortedPermissions) {
    const inherited = isInheritedPermission(
      { to, from, via, role, viaRole },
      toPartyUuid,
      fromPartyUuid,
    );

    if (via) {
      const parent = ensurePermissionNode(group, via, false);
      const child = ensurePermissionChildNode(parent, to, inherited);

      if (viaRole) {
        addRole(child, viaRole.id, viaRole.code, via);
      }

      continue;
    }

    const root = ensurePermissionNode(group, to, inherited);

    if (role) {
      addRole(root, role.id, role.code);
    }

    if ((root.children?.length ?? 0) > 0) {
      const child = ensurePermissionChildNode(root, to, inherited);

      if (role) {
        addRole(child, role.id, role.code);
      }
    }
  }

  return Object.values(group);
};

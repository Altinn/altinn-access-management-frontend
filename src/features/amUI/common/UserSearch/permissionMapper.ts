import type { Permissions } from '@/dataObjects/dtos/accessPackage';
import type { Entity } from '@/dataObjects/dtos/Common';

import { addRole, buildSortKey, normalizeType } from './mapperUtils';
import type { UserSearchNode } from './types';

const mapEntityToUserSearchNode = (entity: Entity, isInherited: boolean): UserSearchNode => ({
  id: entity.id,
  name: entity.name,
  type: normalizeType(entity.type),
  variant: entity.variant,
  partyId: entity.partyId,
  organizationIdentifier: entity.organizationIdentifier,
  isDeleted: entity.isDeleted ?? undefined,
  dateOfBirth: entity.dateOfBirth,
  sortKey: buildSortKey(entity.name),
  roles: [],
  children: null,
  isInherited,
});

export const mapPermissionsToUserSearchNodes = (
  permissions?: Permissions[],
  { toPartyUuid = '', fromPartyUuid = '' }: { toPartyUuid?: string; fromPartyUuid?: string } = {},
): UserSearchNode[] => {
  if (!permissions?.length) {
    return [];
  }

  const hasViaEntity = (permission: Permissions) => permission.via != null;

  const nodes: UserSearchNode[] = [];
  const sortedPermissions = [...permissions].sort((a, b) => {
    if (hasViaEntity(a) && !hasViaEntity(b)) return -1;
    if (hasViaEntity(b) && !hasViaEntity(a)) return 1;
    return 0;
  });

  const isInherited = ({ to, from, role, via, viaRole }: Permissions) => {
    if (toPartyUuid !== to.id && fromPartyUuid !== from.id) {
      return true;
    }
    if (role && role.code !== 'rettighetshaver') {
      return true;
    }
    if (via != null || viaRole != null) {
      return true;
    }
    return false;
  };

  const getOrCreateTopLevelPermissionNode = (entity: Entity, inherited: boolean) => {
    const existingNode = nodes.find((node) => node.id === entity.id);

    if (existingNode) {
      existingNode.isInherited = existingNode.isInherited || inherited;
      return existingNode;
    }

    const newNode = mapEntityToUserSearchNode(entity, inherited);
    nodes.push(newNode);
    return newNode;
  };

  const getOrCreateChildPermissionNode = (
    parent: UserSearchNode,
    entity: Entity,
    inherited: boolean,
  ) => {
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

    if (hasViaEntity(permission)) {
      const viaNode = getOrCreateTopLevelPermissionNode(permission.via, false);
      const child = getOrCreateChildPermissionNode(viaNode, permission.to, inherited);

      if (permission.viaRole) {
        addRole(child, permission.viaRole.id, permission.viaRole.code, permission.via);
      }

      continue;
    }

    const topLevelNode = getOrCreateTopLevelPermissionNode(permission.to, inherited);

    if (permission.role) {
      addRole(topLevelNode, permission.role.id, permission.role.code);
    }

    // If inherited entries already exist under this node, keep direct entries in that same group.
    if ((topLevelNode.children?.length ?? 0) > 0) {
      const child = getOrCreateChildPermissionNode(topLevelNode, permission.to, inherited);

      if (permission.role) {
        addRole(child, permission.role.id, permission.role.code);
      }
    }
  }

  return nodes;
};

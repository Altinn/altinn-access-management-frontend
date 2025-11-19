import type { Party } from '@/rtk/features/lookupApi';
import type { Permissions, Role, RolePermission } from '@/rtk/features/roleApi';
import { ViaAgent } from './RoleInfo.stories';

export enum RoleStatusType {
  ViaRole = 'via_role',
  ViaParent = 'via_parent',
  ViaAgent = 'via_agent',
}

export interface RoleStatusMessageType {
  type: RoleStatusType;
  via?: Permissions['via'];
}

interface UseInheritedRoleInfoParams {
  rolePermissions?: RolePermission[];
  role?: Role;
  toParty?: Party;
  fromParty?: Party;
  actingParty?: Party;
}

const getRoleStatus = (permission: Permissions, isActingTo: boolean, isActingFrom: boolean) => {
  if (!permission.via) {
    return null;
  }
  if (permission.viaRole) {
    return {
      type: RoleStatusType.ViaRole,
      via: permission.via,
    };
  }
  if (isActingTo) {
    return {
      type: RoleStatusType.ViaParent,
      via: permission.via,
    };
  }
  if (isActingFrom) {
    return {
      type: RoleStatusType.ViaAgent,
      via: permission.via,
    };
  }
  return null;
};

export const useInheritedRoleInfo = ({
  rolePermissions,
  role,
  toParty,
  fromParty,
  actingParty,
}: UseInheritedRoleInfoParams): RoleStatusMessageType | undefined => {
  if (!role) {
    return undefined;
  }

  const matchingPermissions = rolePermissions?.find((permission) => permission.role.id === role.id);

  const relevantPermission = matchingPermissions?.permissions.find(
    (permission) => !toParty?.partyUuid || permission.to?.id === toParty.partyUuid,
  );

  if (!relevantPermission) {
    return undefined;
  }

  const isActingTo = !!actingParty?.partyUuid && actingParty.partyUuid === toParty?.partyUuid;
  const isActingFrom = !!actingParty?.partyUuid && actingParty.partyUuid === fromParty?.partyUuid;

  return getRoleStatus(relevantPermission, isActingTo, isActingFrom) ?? undefined;
};

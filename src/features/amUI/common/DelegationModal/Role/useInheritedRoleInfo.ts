import type { Party } from '@/rtk/features/lookupApi';
import type { Permissions, Role, RolePermission } from '@/rtk/features/roleApi';

export enum RoleStatusType {
  ViaRole = 'via_role',
  ViaParent = 'via_parent',
  ViaAgent = 'via_agent',
}

export interface RoleStatusMessageType {
  type: RoleStatusType;
  viaRole?: Permissions['viaRole'];
  via?: Permissions['via'];
  from?: Permissions['from'];
  to?: Permissions['to'];
}

interface UseInheritedRoleInfoParams {
  rolePermissions?: RolePermission[];
  role?: Role;
  toParty?: Party;
  fromParty?: Party;
  actingParty?: Party;
}

const getRoleStatus = (permission: Permissions, isActingTo: boolean, isActingFrom: boolean) => {
  if (permission.viaRole && permission.via) {
    return {
      type: RoleStatusType.ViaRole,
      viaRole: permission.viaRole,
      from: permission.from,
      via: permission.via,
      to: permission.to,
    };
  }
  if (permission.via) {
    if (isActingTo) {
      return {
        type: RoleStatusType.ViaParent,
        viaRole: permission.viaRole,
        from: permission.from,
        via: permission.via,
        to: permission.to,
      };
    }
    if (isActingFrom) {
      return {
        type: RoleStatusType.ViaAgent,
        viaRole: permission.viaRole,
        from: permission.from,
        via: permission.via,
        to: permission.to,
      };
    }
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
  const matchingPermissions = rolePermissions?.find(
    (permission) => permission.role.id === role?.id,
  );

  const relevantPermission = matchingPermissions?.permissions.find((permission) => {
    if (!toParty?.partyUuid) {
      return true;
    }
    return permission.to?.id === toParty.partyUuid;
  });

  const status = relevantPermission
    ? getRoleStatus(
        relevantPermission,
        !!actingParty?.partyUuid && actingParty.partyUuid === toParty?.partyUuid,
        !!actingParty?.partyUuid && actingParty.partyUuid === fromParty?.partyUuid,
      )
    : undefined;

  return !!status ? status : undefined;
};

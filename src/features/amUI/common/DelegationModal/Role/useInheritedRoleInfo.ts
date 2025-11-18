import { useMemo } from 'react';

import type { Party } from '@/rtk/features/lookupApi';
import type { Role, RolePermission } from '@/rtk/features/roleApi';
import { isInherited } from '../../AccessPackageList/useAreaPackageList';

interface UseInheritedRoleInfoParams {
  rolePermissions?: RolePermission[];
  role?: Role;
  toParty?: Party;
  fromParty?: Party;
}

interface UseInheritedRoleInfoResult {
  hasInheritedRole: boolean;
  inheritedRoleOrgName?: string;
}

export const useInheritedRoleInfo = ({
  rolePermissions,
  role,
  toParty,
  fromParty,
}: UseInheritedRoleInfoParams): UseInheritedRoleInfoResult => {
  return useMemo(() => {
    if (!rolePermissions || !role?.id) {
      return { hasInheritedRole: false, inheritedRoleOrgName: undefined };
    }

    const matchingConnection = rolePermissions.find((permission) => permission.role.id === role.id);
    if (!matchingConnection) {
      return { hasInheritedRole: false, inheritedRoleOrgName: undefined };
    }

    const inheritedPermission = matchingConnection.permissions.find((permission) =>
      isInherited(permission, toParty?.partyUuid ?? '', fromParty?.partyUuid ?? ''),
    );
    if (!inheritedPermission) {
      return { hasInheritedRole: false, inheritedRoleOrgName: undefined };
    }

    const inheritedFromOrg =
      inheritedPermission.via?.name ?? inheritedPermission.from.name ?? fromParty?.name;

    return {
      hasInheritedRole: true,
      inheritedRoleOrgName: inheritedFromOrg,
    };
  }, [rolePermissions, role?.id, toParty?.partyUuid, fromParty?.partyUuid, fromParty?.name]);
};

import { useMemo } from 'react';

import type { Party } from '@/rtk/features/lookupApi';
import type { Role, RolePermission } from '@/rtk/features/roleApi';

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

    const matchingPermissions = rolePermissions.find(
      (permission) => permission.role.id === role.id,
    );
    if (matchingPermissions) {
      const inheritedVia = matchingPermissions.permissions.find((p) => p.via && p.viaRole);
      return { hasInheritedRole: !!inheritedVia, inheritedRoleOrgName: inheritedVia?.via?.name };
    }

    return { hasInheritedRole: false, inheritedRoleOrgName: undefined };
  }, [rolePermissions, role?.id, toParty?.partyUuid, fromParty?.partyUuid, fromParty?.name]);
};

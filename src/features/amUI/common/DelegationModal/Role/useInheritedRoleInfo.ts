import { useMemo } from 'react';

import type { Party } from '@/rtk/features/lookupApi';
import type { Role, RolePermission } from '@/rtk/features/roleApi';
import { Entity } from '@/dataObjects/dtos/Common';

interface UseInheritedRoleInfoParams {
  rolePermissions?: RolePermission[];
  role?: Role;
  toParty?: Party;
  fromParty?: Party;
}

interface UseInheritedRoleInfoResult {
  hasInheritedRole: boolean;
  inheritedRoleFromEntity?: Entity;
}

export const useInheritedRoleInfo = ({
  rolePermissions,
  role,
  toParty,
  fromParty,
}: UseInheritedRoleInfoParams): UseInheritedRoleInfoResult => {
  return useMemo(() => {
    if (!rolePermissions || !role?.id) {
      return { hasInheritedRole: false, inheritedRoleFromEntity: undefined };
    }

    const matchingPermissions = rolePermissions.find(
      (permission) => permission.role.id === role.id,
    );

    if (matchingPermissions) {
      const inheritedVia = matchingPermissions.permissions.find((p) => !!p.via);
      return { hasInheritedRole: !!inheritedVia, inheritedRoleFromEntity: inheritedVia?.via };
    }

    return { hasInheritedRole: false, inheritedRoleFromEntity: undefined };
  }, [rolePermissions, role?.id, toParty?.partyUuid, fromParty?.partyUuid, fromParty?.name]);
};

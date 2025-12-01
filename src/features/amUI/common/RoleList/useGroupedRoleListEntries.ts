import { useMemo } from 'react';

import type { RolePermission } from '@/rtk/features/roleApi';
import { A2_PROVIDER_CODE, ECC_PROVIDER_CODE } from '../UserRoles/useRoleMetadata';

type UseGroupedRoleListEntriesParams = {
  permissions?: RolePermission[];
};

type UseGroupedRoleListEntriesResult = {
  altinn2Roles: RolePermission[];
  userRoles: RolePermission[];
};

export const useGroupedRoleListEntries = ({
  permissions,
}: UseGroupedRoleListEntriesParams): UseGroupedRoleListEntriesResult => {
  const { altinn2Roles, userRoles } = useMemo(() => {
    if (!permissions) {
      return {
        altinn2Roles: [],
        userRoles: [],
      };
    }

    const collator = new Intl.Collator(undefined, { sensitivity: 'base' });
    const groups = {
      altinn2Roles: [] as RolePermission[],
      userRoles: [] as RolePermission[],
    };

    permissions.forEach((connection) => {
      const providerCode = connection.role.provider?.code;
      if (!providerCode) {
        return;
      }
      if (providerCode === A2_PROVIDER_CODE) {
        groups.altinn2Roles.push(connection);
      } else if (providerCode === ECC_PROVIDER_CODE) {
        groups.userRoles.push(connection);
      }
    });

    groups.altinn2Roles.sort((a, b) => collator.compare(a.role.name, b.role.name));
    groups.userRoles.sort((a, b) => collator.compare(a.role.name, b.role.name));

    return groups;
  }, [permissions]);

  return {
    altinn2Roles,
    userRoles,
  };
};

import { useMemo } from 'react';
import { type AvatarProps } from '@altinn/altinn-components';

import type { Permissions } from '@/dataObjects/dtos/accessPackage';
import { PartyEntityType } from '@/dataObjects/dtos/Party';
import {
  isSubUnitByType,
  formatEntityDisplayName,
  getAvatarType,
} from '@/resources/utils/reporteeUtils';

export const usePermissionOverview = ({ permissions }: { permissions: Permissions[] }) => {
  const calculatedPermissions = useMemo(() => {
    const seen = new Set<string>();
    const result: AvatarProps[] = [];

    for (const perm of permissions) {
      const to = perm?.to;
      const id = to?.id;
      if (!to || !id) continue;
      if (seen.has(id)) continue;
      if (to.type === PartyEntityType.SystemUser) continue; // skip system users
      const isPerson = to.type === PartyEntityType.Person;
      const type = getAvatarType(to);
      const name = formatEntityDisplayName(to);
      const isParent = !isPerson && !isSubUnitByType(to.unitType);
      seen.add(id);
      result.push({
        id,
        name,
        size: 'md',
        type,
        isParent,
        isDeleted: to?.isDeleted ?? undefined,
      });
    }

    return result;
  }, [permissions]);

  return { permissionsOverview: calculatedPermissions };
};

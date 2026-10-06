import { useMemo } from 'react';
import { type AvatarProps, formatDisplayName } from '@altinn/altinn-components';

import type { Permissions } from '@/dataObjects/dtos/accessPackage';
import { isSubUnitByType } from '@/resources/utils/reporteeUtils';

export const usePermissionOverview = ({ permissions }: { permissions: Permissions[] }) => {
  const calculatedPermissions = useMemo(() => {
    const seen = new Set<string>();
    const result: AvatarProps[] = [];

    for (const perm of permissions) {
      const to = perm?.to;
      const id = to?.id;
      if (!to || !id) continue;
      if (seen.has(id)) continue;
      if (to.type === 'Systembruker') continue; // skip system users
      const isPerson = to?.type === 'Person';
      const type = isPerson ? 'person' : 'company';
      const name = formatDisplayName({
        fullName: to?.name || '',
        type,
      });
      const isParent = !isPerson && !isSubUnitByType(to.variant);
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

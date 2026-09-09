import { useMemo } from 'react';
import { AvatarProps, formatDisplayName } from '@altinn/altinn-components';
import type { Permissions } from '@/dataObjects/dtos/accessPackage';
import { isSubUnitByType } from '@/resources/utils/reporteeUtils';

export const usePackagePermissionOverview = ({ permissions }: { permissions: Permissions[] }) => {
  const calculatedPermissions = useMemo(() => {
    const seen = new Set<string>();
    const result: AvatarProps[] = [];

    for (const perm of permissions) {
      const to = perm?.to;
      const id = to?.id;
      if (!to || !id) continue;
      if (seen.has(id)) continue;
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
      });
    }

    return result;
  }, [permissions]);

  return { permissionsOverview: calculatedPermissions };
};

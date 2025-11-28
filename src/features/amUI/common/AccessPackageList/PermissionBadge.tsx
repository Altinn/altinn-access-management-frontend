import { AvatarGroup, AvatarProps, formatDisplayName } from '@altinn/altinn-components';
import { useMemo } from 'react';
import type { Permissions } from '@/dataObjects/dtos/accessPackage';
import { isSubUnitByType } from '@/resources/utils/reporteeUtils';

interface PermissionBadgeProps {
  permissions?: Permissions[];
}

export const PermissionBadge = ({ permissions }: PermissionBadgeProps) => {
  const items = useMemo<AvatarProps[]>(() => {
    if (!permissions || permissions.length === 0) return [];
    const seen = new Set<string>();
    const result: AvatarProps[] = [];

    for (const perm of permissions) {
      const to = perm?.to;
      const id = to?.id;
      if (!to || !id) continue;
      if (seen.has(id)) continue;
      const name = formatDisplayName({
        fullName: to?.name || '',
        type: to?.type === 'Person' ? 'person' : 'company',
      });
      const isSubunit = to && isSubUnitByType(to.variant);
      seen.add(id);
      result.push({
        name,
        size: 'md',
        type: to.type.toLowerCase() === 'organisasjon' ? 'company' : 'person',
        isParent: !isSubunit,
      });
    }
    return result;
  }, [permissions]);

  return <AvatarGroup items={items} />;
};

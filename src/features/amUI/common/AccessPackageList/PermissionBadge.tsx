import { AvatarGroup, AvatarProps } from '@altinn/altinn-components';
import { useMemo } from 'react';
import type { Permissions } from '@/dataObjects/dtos/accessPackage';

interface PermissionBadgeProps {
  permissions?: Permissions[];
}

export const PermissionBadge = ({ permissions }: PermissionBadgeProps) => {
  const items = useMemo<AvatarProps[]>(() => {
    if (!permissions || permissions.length === 0) return [];
    const seen = new Set<string>();
    const result: AvatarProps[] = [];

    for (const perm of permissions) {
      const to = perm?.to as { id?: string; name: string; type: string } | undefined;
      const id = to?.id;
      if (!to || !id) continue;
      if (seen.has(id)) continue;
      seen.add(id);
      result.push({
        name: to.name,
        size: 'md',
        type: to.type.toLowerCase() === 'organisasjon' ? 'company' : 'person',
      });
    }
    return result;
  }, [permissions]);

  return <AvatarGroup items={items} />;
};

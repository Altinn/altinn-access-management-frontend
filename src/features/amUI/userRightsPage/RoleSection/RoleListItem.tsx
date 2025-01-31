import type { ReactNode } from 'react';
import { AccessPackageListItem } from '@altinn/altinn-components';

import { useDelegationCheckQuery, type Role } from '@/rtk/features/roleApi';

interface RoleLIstItemProps {
  reporteeUuid: string;
  role: Role;
  onClick: () => void;
  controls: ReactNode;
}

export const RoleListItem = ({ reporteeUuid, role, onClick, controls }: RoleLIstItemProps) => {
  const isDelegatable = useDelegationCheckQuery({
    rightownerUuid: reporteeUuid,
    roleUuid: role.id,
  });
  console.log('🚀 ~ RoleListItem ~ isDelegatable:', isDelegatable.data);
  return (
    <li>
      <AccessPackageListItem
        id={role.id}
        onClick={onClick}
        as='button'
        title={role.name}
        size='sm'
        controls={controls}
      />
    </li>
  );
};

import { ListItem } from '@altinn/altinn-components';

import type { Role } from '@/rtk/features/roleApi';

interface RoleLIstItemProps {
  role: Role;
  onClick: () => void;
  loading?: boolean;
}

export const RoleListItem = ({ role, onClick, loading }: RoleLIstItemProps) => {
  return (
    <ListItem
      id={role.id}
      onClick={onClick}
      as='button'
      title={{ as: 'h3', children: role.name }}
      size='sm'
      loading={loading}
    />
  );
};

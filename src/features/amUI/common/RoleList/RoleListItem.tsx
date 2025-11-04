import { ListItem } from '@altinn/altinn-components';

import type { Role } from '@/rtk/features/roleApi';

interface RoleListItemProps {
  role: Role;
  onClick: () => void;
  description?: string | null;
  active?: boolean;
  controls?: React.ReactNode;
  loading?: boolean;
}

export const RoleListItem = ({
  role,
  onClick,
  description,
  active = false,
  loading,
  controls,
}: RoleListItemProps) => {
  return (
    <ListItem
      id={role.id}
      onClick={onClick}
      as='button'
      title={{ as: 'h3', children: role.name }}
      description={description ?? undefined}
      size='sm'
      color={active ? 'company' : 'neutral'}
      loading={loading}
      controls={controls}
    />
  );
};

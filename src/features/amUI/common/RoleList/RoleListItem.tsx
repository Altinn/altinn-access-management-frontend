import { ListItem } from '@altinn/altinn-components';

import type { ExtendedRole } from '@/rtk/features/roleApi';

interface RoleLIstItemProps {
  role: ExtendedRole;
  onClick: () => void;
  active?: boolean;
  controls: React.ReactNode;
  loading?: boolean;
}

export const RoleListItem = ({
  role,
  onClick,
  active = false,
  loading,
  controls,
}: RoleLIstItemProps) => {
  return (
    <ListItem
      id={role.id}
      onClick={onClick}
      as='button'
      title={{ as: 'h3', children: role.name }}
      size='sm'
      color={active ? 'company' : 'neutral'}
      variant='tinted'
      loading={loading}
      controls={controls}
    />
  );
};

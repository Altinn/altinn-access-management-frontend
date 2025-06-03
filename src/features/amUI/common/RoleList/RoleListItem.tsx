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
      title={{ children: role.name, as: 'h3' }}
      size='sm'
      color={active ? 'company' : 'neutral'}
      variant='subtle'
      loading={loading}
      controls={controls}
    />
  );
};

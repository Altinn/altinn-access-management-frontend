import { ListItem } from '@altinn/altinn-components';

import type { ExtendedRole } from '@/rtk/features/roleApi';
import type { Party } from '@/rtk/features/lookupApi';

interface RoleLIstItemProps {
  role: ExtendedRole;
  onClick: () => void;
  toParty?: Party;
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
      title={role.name}
      size='sm'
      color={active ? 'company' : 'neutral'}
      theme='subtle'
      loading={loading}
      controls={controls}
    />
  );
};

import { ListItem } from '@altinn/altinn-components';
import type { Role } from '@/rtk/features/roleApi';

interface RoleLIstItemProps {
  role: Role;
  onClick: () => void;
  loading?: boolean;
  deleteButton?: React.ReactNode;
}

export const RoleListItem = ({ role, onClick, loading, deleteButton }: RoleLIstItemProps) => {
  return (
    <ListItem
      id={role.id}
      onClick={onClick}
      as='button'
      title={{ as: 'div', children: role.name }}
      size='sm'
      loading={loading}
      controls={deleteButton ? deleteButton : undefined}
    />
  );
};

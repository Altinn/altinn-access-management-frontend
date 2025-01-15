import type { BadgeColor } from '@altinn/altinn-components';
import { Badge } from '@altinn/altinn-components';

import { useGetRolesForUserQuery } from '@/rtk/features/roleApi';

import classes from './userRoles.module.css';

interface UserRulesProps {
  rightOwnerUuid: string;
  rightHolderUuid: string;
}

export const UserRoles = ({ rightOwnerUuid, rightHolderUuid }: UserRulesProps) => {
  const { data } = useGetRolesForUserQuery({
    rightOwnerUuid: rightOwnerUuid,
    rightHolderUuid: rightHolderUuid,
  });
  return (
    <div className={classes.userRoles}>
      {data?.map((role) => (
        <Badge
          color={'subtle' as BadgeColor}
          label={role.role.name}
          key={role.id}
        />
      ))}
    </div>
  );
};

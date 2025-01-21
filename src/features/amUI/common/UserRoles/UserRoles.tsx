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
      {data?.map((assignment) => {
        const color = assignment?.role?.urn?.includes('brreg') ? 'company' : 'accent';
        return (
          <Badge
            color={color}
            label={assignment.role.name}
            key={assignment.id}
          />
        );
      })}
    </div>
  );
};

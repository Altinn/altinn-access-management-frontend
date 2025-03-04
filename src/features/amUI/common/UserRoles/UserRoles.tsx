import { Badge } from '@altinn/altinn-components';
import cn from 'classnames';

import { useGetRolesForUserQuery } from '@/rtk/features/roleApi';

import classes from './userRoles.module.css';

interface UserRulesProps extends React.HTMLAttributes<HTMLDivElement> {
  rightOwnerUuid: string;
  rightHolderUuid: string;
}

export const UserRoles = ({
  rightOwnerUuid,
  rightHolderUuid,
  className,
  ...props
}: UserRulesProps) => {
  const { data } = useGetRolesForUserQuery({
    rightOwnerUuid: rightOwnerUuid,
    rightHolderUuid: rightHolderUuid,
  });
  return (
    <div
      className={cn(classes.userRoles, className)}
      {...props}
    >
      {data?.map((assignment) => {
        const isER = assignment?.role?.urn?.includes('brreg:');
        return (
          <Badge
            color={isER ? 'info' : 'company'}
            label={assignment.role.name}
            key={assignment.id}
            theme={isER ? 'base' : 'subtle'}
          />
        );
      })}
    </div>
  );
};

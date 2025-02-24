import {
  type ExtendedRole,
  useGetRolesForUserQuery,
  useGetRolesQuery,
} from '@/rtk/features/roleApi';
import classes from './roleSection.module.css';
import { useMemo } from 'react';
import { Heading } from '@digdir/designsystemet-react';
import { ListBase } from '@altinn/altinn-components';
import { RoleListItem } from './RoleListItem';
import { useParams } from 'react-router-dom';
import { useGetPartyByUUIDQuery } from '@/rtk/features/lookupApi';
import { SkeletonRoleList } from './SkeletonRoleList';

interface RoleListProps {
  from: string;
  to: string;
}

export const RoleList = ({ from, to }: RoleListProps) => {
  const { id: rightHolderUuid } = useParams();
  const { data: party, isLoading: partyIsLoading } = useGetPartyByUUIDQuery(rightHolderUuid ?? '');
  const { data: roleAreas, isLoading: roleAreasIsLoading } = useGetRolesQuery();
  const { data: userRoles, isLoading: iserRolesIsLoading } = useGetRolesForUserQuery({
    from,
    to,
  });

  const groupedRoles = useMemo(
    () =>
      roleAreas?.map((roleArea) => {
        const { activeRoles, availableRoles } = roleArea.roles.reduce(
          (res, role) => {
            const roleAssignment = userRoles?.find((userRole) => userRole.role.id === role.id);
            if (roleAssignment)
              res.activeRoles.push({
                ...role,
                inherited: roleAssignment.inherited,
                assignmentId: roleAssignment.id,
              });
            else res.availableRoles.push({ ...role, inherited: [] });
            return res;
          },
          {
            activeRoles: [] as ExtendedRole[],
            availableRoles: [] as ExtendedRole[],
          },
        );
        return {
          ...roleArea,
          activeRoles,
          availableRoles,
        };
      }),
    [roleAreas, userRoles],
  );

  if (partyIsLoading || roleAreasIsLoading || iserRolesIsLoading) {
    return <SkeletonRoleList />;
  }
  return (
    <div className={classes.areas}>
      {groupedRoles?.map((roleArea) => (
        <div
          key={roleArea.id}
          className={classes.roleArea}
        >
          <Heading
            level={2}
            size='xs'
            id={roleArea.id}
          >
            {roleArea.name}
          </Heading>
          <ListBase>
            {roleArea.activeRoles.map((role) => (
              <RoleListItem
                key={role.id}
                role={role}
                reporteeUuid={from}
                toParty={party}
                assignmentId={role.assignmentId}
                //   onClick={() => setModalItem(role)}
              />
            ))}
          </ListBase>
          <ListBase>
            {roleArea.availableRoles.map((role) => (
              <RoleListItem
                key={role.id}
                role={role}
                reporteeUuid={from}
                toParty={party}
                //   onClick={() => setModalItem(role)}
              />
            ))}
          </ListBase>
        </div>
      ))}
    </div>
  );
};

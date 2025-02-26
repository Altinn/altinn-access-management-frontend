import { useMemo } from 'react';
import { Heading } from '@digdir/designsystemet-react';
import { Button, ListBase } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import {
  type ExtendedRole,
  useGetRolesForUserQuery,
  useGetRolesQuery,
} from '@/rtk/features/roleApi';
import { useGetPartyByUUIDQuery } from '@/rtk/features/lookupApi';

import { RoleListItem } from './RoleListItem';
import classes from './roleSection.module.css';
import { SkeletonRoleList } from './SkeletonRoleList';
import { RevokeRoleButton } from './RevokeRoleButton';
import { DelegateRoleButton } from './DelegateRoleButton';

export enum RoleActions {
  DELEGATE = 'DELEGATE',
  REQUEST = 'REQUEST',
  REVOKE = 'REVOKE',
}

interface RoleListProps {
  from: string;
  to: string;
  onSelect: (role: ExtendedRole) => void;
  availableActions?: RoleActions[];
  isLoading?: boolean;
}

export const RoleList = ({ from, to, onSelect, availableActions, isLoading }: RoleListProps) => {
  const { t } = useTranslation();
  const { data: party, isLoading: partyIsLoading } = useGetPartyByUUIDQuery(to ?? '');
  const { data: roleAreas, isLoading: roleAreasIsLoading } = useGetRolesQuery();
  const { data: userRoles, isLoading: userRolesIsLoading } = useGetRolesForUserQuery({
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

  if (partyIsLoading || roleAreasIsLoading || userRolesIsLoading || isLoading) {
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
                active
                toParty={party}
                onClick={() => {
                  onSelect(role);
                }}
                controls={
                  availableActions?.includes(RoleActions.REVOKE) && (
                    <RevokeRoleButton
                      key={role.id}
                      assignmentId={role?.assignmentId ?? ''}
                      roleName={role.name}
                      toParty={party}
                      fullText={false}
                      size='sm'
                      disabled={role.inherited?.length > 0}
                    />
                  )
                }
              />
            ))}
          </ListBase>
          <ListBase>
            {roleArea.availableRoles.map((role) => (
              <RoleListItem
                key={role.id}
                role={role}
                toParty={party}
                onClick={() => onSelect(role)}
                controls={
                  <>
                    {availableActions?.includes(RoleActions.DELEGATE) && (
                      <DelegateRoleButton
                        key={role.id}
                        roleId={role.id}
                        roleName={role.name}
                        toParty={party}
                        fullText={false}
                        size='sm'
                      />
                    )}
                    {availableActions?.includes(RoleActions.REQUEST) && (
                      <Button
                        key={role.id}
                        size='sm'
                        variant='outline'
                        disabled
                      >
                        {t('common.request_poa')}
                      </Button>
                    )}
                  </>
                }
              />
            ))}
          </ListBase>
        </div>
      ))}
    </div>
  );
};

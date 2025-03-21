import { useMemo } from 'react';
import { Heading } from '@digdir/designsystemet-react';
import { ListBase } from '@altinn/altinn-components';

import {
  type ExtendedRole,
  Role,
  useGetRolesForUserQuery,
  useGetRolesQuery,
} from '@/rtk/features/roleApi';
import { Party, useGetPartyByUUIDQuery } from '@/rtk/features/lookupApi';

import { DelegationAction } from '../DelegationModal/EditModal';

import { RoleListItem } from './RoleListItem';
import classes from './roleSection.module.css';
import { SkeletonRoleList } from './SkeletonRoleList';
import { RevokeRoleButton } from './RevokeRoleButton';
import { DelegateRoleButton } from './DelegateRoleButton';
import { RequestRoleButton } from './RequestRoleButton';
import { ActionError } from '@/resources/hooks/useActionError';

interface RoleListProps {
  from: string;
  to: string;
  onSelect: (role: ExtendedRole) => void;
  availableActions?: DelegationAction[];
  isLoading?: boolean;
  onActionError: (role: Role, error: ActionError) => void;
}

export const RoleList = ({
  from,
  to,
  onSelect,
  availableActions,
  isLoading,
  onActionError,
}: RoleListProps) => {
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
            level={3}
            data-size='xs'
            id={roleArea.id}
          >
            {roleArea.name}
          </Heading>
          <div
            key={roleArea.id}
            className={classes.roleLists}
          >
            {roleArea.activeRoles.length > 0 && (
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
                      availableActions?.includes(DelegationAction.REVOKE) && (
                        <RevokeRoleButton
                          key={role.id}
                          assignmentId={role?.assignmentId ?? ''}
                          accessRole={role}
                          toParty={party}
                          fullText={false}
                          size='sm'
                          disabled={role.inherited?.length > 0}
                          onRevokeError={onActionError}
                        />
                      )
                    }
                  />
                ))}
              </ListBase>
            )}
            {roleArea.availableRoles.length > 0 && (
              <ListBase>
                {roleArea.availableRoles.map((role) => (
                  <RoleListItem
                    key={role.id}
                    role={role}
                    toParty={party}
                    onClick={() => onSelect(role)}
                    controls={
                      <>
                        {availableActions?.includes(DelegationAction.DELEGATE) && (
                          <DelegateRoleButton
                            accessRole={role}
                            key={role.id}
                            toParty={party}
                            fullText={false}
                            size='sm'
                            onDelegateError={onActionError}
                          />
                        )}
                        {availableActions?.includes(DelegationAction.REQUEST) && (
                          <RequestRoleButton />
                        )}
                      </>
                    }
                  />
                ))}
              </ListBase>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

import { useMemo } from 'react';
import { List } from '@altinn/altinn-components';

import type { Role, ExtendedRole } from '@/rtk/features/roleApi';
import { useGetRolesForUserQuery, useGetRolesQuery } from '@/rtk/features/roleApi';
import type { ActionError } from '@/resources/hooks/useActionError';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

import { DelegationAction } from '../DelegationModal/EditModal';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';

import { RoleListItem } from './RoleListItem';
import classes from './roleSection.module.css';
import { SkeletonRoleList } from './SkeletonRoleList';
import { RevokeRoleButton } from './RevokeRoleButton';
import { DelegateRoleButton } from './DelegateRoleButton';
import { RequestRoleButton } from './RequestRoleButton';

interface RoleListProps {
  onSelect: (role: ExtendedRole) => void;
  availableActions?: DelegationAction[];
  isLoading?: boolean;
  onActionError: (role: Role, error: ActionError) => void;
}

export const RoleList = ({
  onSelect,
  availableActions,
  isLoading,
  onActionError,
}: RoleListProps) => {
  const { fromParty, toParty, isLoading: partyIsLoading } = usePartyRepresentation();
  const { data: roleAreas, isLoading: roleAreasIsLoading } = useGetRolesQuery();
  const { data: userRoles, isLoading: userRolesIsLoading } = useGetRolesForUserQuery({
    from: fromParty?.partyUuid ?? '',
    to: toParty?.partyUuid ?? '',
  });

  const isSm = useIsMobileOrSmaller();

  const groupedRoles = useMemo(() => {
    return roleAreas?.reduce(
      (res, roleArea) => {
        roleArea.roles.forEach((role) => {
          const roleAssignment = userRoles?.find((userRole) => userRole.role.id === role.id);
          if (roleAssignment) {
            res.activeRoles.push({
              ...role,
              inherited: roleAssignment.inherited,
              assignmentId: roleAssignment.id,
            });
          } else {
            res.availableRoles.push({ ...role, inherited: [] });
          }
        });
        return res;
      },
      {
        activeRoles: [] as ExtendedRole[],
        availableRoles: [] as ExtendedRole[],
      },
    );
  }, [roleAreas, userRoles]);

  if (partyIsLoading || roleAreasIsLoading || userRolesIsLoading || isLoading) {
    return <SkeletonRoleList />;
  }
  return (
    <div className={classes.roleLists}>
      {groupedRoles && groupedRoles.activeRoles.length > 0 && (
        <List>
          {groupedRoles.activeRoles.map((role) => (
            <RoleListItem
              key={role.id}
              role={role}
              active
              onClick={() => {
                onSelect(role);
              }}
              controls={
                !isSm &&
                availableActions?.includes(DelegationAction.REVOKE) && (
                  <RevokeRoleButton
                    key={role.id}
                    assignmentId={role?.assignmentId ?? ''}
                    accessRole={role}
                    fullText={false}
                    size='sm'
                    disabled={role.inherited?.length > 0}
                    onRevokeError={onActionError}
                  />
                )
              }
            />
          ))}
        </List>
      )}
      {groupedRoles && groupedRoles.availableRoles.length > 0 && (
        <List>
          {groupedRoles.availableRoles.map((role) => (
            <RoleListItem
              key={role.id}
              role={role}
              onClick={() => onSelect(role)}
              controls={
                !isSm && (
                  <>
                    {availableActions?.includes(DelegationAction.DELEGATE) && (
                      <DelegateRoleButton
                        accessRole={role}
                        key={role.id}
                        fullText={false}
                        size='sm'
                        onDelegateError={onActionError}
                        onSelect={() => {
                          onSelect(role);
                        }}
                        showSpinner={true}
                        showWarning={true}
                      />
                    )}
                    {availableActions?.includes(DelegationAction.REQUEST) && <RequestRoleButton />}
                  </>
                )
              }
            />
          ))}
        </List>
      )}
    </div>
  );
};

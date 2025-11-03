import { useMemo } from 'react';
import { List } from '@altinn/altinn-components';

import type { Role, RoleConnection } from '@/rtk/features/roleApi';
import { useGetRolesForUserQuery, useGetRolesQuery } from '@/rtk/features/roleApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
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
  onSelect: (role: Role) => void;
  availableActions?: DelegationAction[];
  isLoading?: boolean;
  onActionError: (role: Role, error: ActionError) => void;
}

interface RoleListEntry {
  role: Role;
  revocation?: { from: string; to: string };
  hasDirectDelegation: boolean;
  hasInheritedDelegation: boolean;
  inheritedFrom?: string;
}

export const RoleList = ({
  onSelect,
  availableActions,
  isLoading,
  onActionError,
}: RoleListProps) => {
  const { fromParty, toParty, actingParty, isLoading: partyIsLoading } = usePartyRepresentation();
  const { data: roleAreas, isLoading: roleAreasIsLoading } = useGetRolesQuery();
  const { data: roleConnections, isLoading: roleConnectionsIsLoading } = useGetRolesForUserQuery(
    {
      from: fromParty?.partyUuid ?? '',
      to: toParty?.partyUuid ?? '',
      party: actingParty?.partyUuid ?? getCookie('AltinnPartyUuid') ?? '',
    },
    {
      skip: !fromParty?.partyUuid || !toParty?.partyUuid,
    },
  );

  const isSm = useIsMobileOrSmaller();

  const groupedRoles = useMemo(() => {
    if (!roleAreas) {
      return undefined;
    }

    const summarizeConnection = (
      connection: RoleConnection | undefined,
    ): Omit<RoleListEntry, 'role'> => {
      if (!connection) {
        return {
          revocation: undefined,
          hasDirectDelegation: false,
          hasInheritedDelegation: false,
        };
      }

      const directPermission = connection.permissions.find(
        (permission) =>
          permission.from?.id === fromParty?.partyUuid && permission.to?.id === toParty?.partyUuid,
      );

      const hasInheritedDelegation = connection.permissions.some(
        (permission) =>
          permission.from?.id !== fromParty?.partyUuid || permission.to?.id !== toParty?.partyUuid,
      );

      const inheritedFrom = connection.permissions.find(
        (permission) =>
          permission.from?.id !== fromParty?.partyUuid || permission.to?.id !== toParty?.partyUuid,
      )?.from?.name;

      return {
        revocation: directPermission
          ? { from: directPermission.from.id, to: directPermission.to.id }
          : undefined,
        hasDirectDelegation: !!directPermission,
        hasInheritedDelegation,
        inheritedFrom,
      };
    };

    return roleAreas.reduce(
      (res, roleArea) => {
        roleArea.roles.forEach((role) => {
          const connection = roleConnections?.find((item) => item.role.id === role.id);

          if (connection) {
            const summary = summarizeConnection(connection);
            res.activeRoles.push({
              role,
              ...summary,
            });
          } else {
            res.availableRoles.push({
              role,
              hasDirectDelegation: false,
              hasInheritedDelegation: false,
            });
          }
        });

        return res;
      },
      {
        activeRoles: [] as RoleListEntry[],
        availableRoles: [] as RoleListEntry[],
      },
    );
  }, [fromParty?.partyUuid, roleAreas, roleConnections, toParty?.partyUuid]);

  if (partyIsLoading || roleAreasIsLoading || roleConnectionsIsLoading || isLoading) {
    return <SkeletonRoleList />;
  }
  return (
    <div className={classes.roleLists}>
      {groupedRoles && groupedRoles.activeRoles.length > 0 && (
        <List>
          {groupedRoles.activeRoles.map((roleEntry) => (
            <RoleListItem
              key={roleEntry.role.id}
              role={roleEntry.role}
              active
              onClick={() => {
                onSelect(roleEntry.role);
              }}
              controls={
                !isSm &&
                availableActions?.includes(DelegationAction.REVOKE) && (
                  <RevokeRoleButton
                    key={roleEntry.role.id}
                    accessRole={roleEntry.role}
                    from={roleEntry.revocation?.from ?? ''}
                    to={roleEntry.revocation?.to ?? ''}
                    fullText={false}
                    size='sm'
                    disabled={!roleEntry.hasDirectDelegation || roleEntry.hasInheritedDelegation}
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
          {groupedRoles.availableRoles.map((roleEntry) => (
            <RoleListItem
              key={roleEntry.role.id}
              role={roleEntry.role}
              onClick={() => onSelect(roleEntry.role)}
              controls={
                !isSm && (
                  <>
                    {availableActions?.includes(DelegationAction.DELEGATE) && (
                      <DelegateRoleButton
                        accessRole={roleEntry.role}
                        key={roleEntry.role.id}
                        fullText={false}
                        size='sm'
                        onDelegateError={onActionError}
                        onSelect={() => {
                          onSelect(roleEntry.role);
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

import { useMemo } from 'react';
import { List, DsParagraph } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { Role, RoleConnection } from '@/rtk/features/roleApi';
import { useGetRolesForUserQuery } from '@/rtk/features/roleApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { ActionError } from '@/resources/hooks/useActionError';
import { revokeRolesEnabled } from '@/resources/utils/featureFlagUtils';

import { DelegationAction } from '../DelegationModal/EditModal';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { RoleListItem } from './RoleListItem';
import { RevokeRoleButton } from './RevokeRoleButton';

import classes from './roleSection.module.css';
import { SkeletonRoleList } from './SkeletonRoleList';

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
  const { t } = useTranslation();
  const { fromParty, toParty, actingParty, isLoading: partyIsLoading } = usePartyRepresentation();
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

  const revokeFeatureEnabled = revokeRolesEnabled();

  const roleListEntries = useMemo(() => {
    if (!roleConnections) {
      return [];
    }

    const directMatch = (connection: RoleConnection) =>
      connection.permissions.find(
        (permission) =>
          permission.from?.id === fromParty?.partyUuid && permission.to?.id === toParty?.partyUuid,
      );

    const collator = new Intl.Collator(undefined, { sensitivity: 'base' });

    return roleConnections
      .map((connection) => {
        const directPermission = directMatch(connection);

        return {
          role: connection.role,
          providerName: connection.role.provider?.name,
          providerCode: connection.role.provider?.code,
          revocation: directPermission
            ? {
                from: directPermission.from.id,
                to: directPermission.to.id,
              }
            : undefined,
        };
      })
      .sort((a, b) => collator.compare(a.role.name, b.role.name));
  }, [fromParty?.partyUuid, roleConnections, toParty?.partyUuid]);

  if (partyIsLoading || roleConnectionsIsLoading || isLoading) {
    return <SkeletonRoleList />;
  }

  if (!roleListEntries.length) {
    return (
      <div className={classes.roleLists}>
        <DsParagraph data-size='sm'>{t('role.no_roles')}</DsParagraph>
      </div>
    );
  }

  return (
    <div className={classes.roleLists}>
      <List aria-label={t('role.activeRolesLabel')}>
        {roleListEntries.map(({ role, providerName, providerCode, revocation }) => {
          const showRevokeButton =
            Boolean(
              availableActions?.includes(DelegationAction.REVOKE) &&
                providerCode === 'sys-altinn2' &&
                revocation,
            ) && revokeFeatureEnabled;

          return (
            <RoleListItem
              key={role.id}
              role={role}
              description={providerName}
              active
              onClick={() => onSelect(role)}
              controls={
                showRevokeButton ? (
                  <RevokeRoleButton
                    accessRole={role}
                    from={revocation?.from ?? ''}
                    to={revocation?.to ?? ''}
                    fullText
                    variant='text'
                    onRevokeError={(errorRole, error) => onActionError(errorRole, error)}
                  />
                ) : undefined
              }
            />
          );
        })}
      </List>
    </div>
  );
};

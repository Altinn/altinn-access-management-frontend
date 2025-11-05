import { useMemo } from 'react';
import { List, DsParagraph, DsHeading, DsLink } from '@altinn/altinn-components';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

import type { Role, RoleConnection } from '@/rtk/features/roleApi';
import { useGetRolesForUserQuery } from '@/rtk/features/roleApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { ActionError } from '@/resources/hooks/useActionError';
import { revokeRolesEnabled } from '@/resources/utils/featureFlagUtils';
import { useFetchRecipientInfo } from '@/resources/hooks/useFetchRecipientInfo';
import { getRedirectToServicesAvailableForUserUrl } from '@/resources/utils';
import { getHostUrl } from '@/resources/utils/pathUtils';

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

type RoleListEntry = {
  role: Role;
  providerCode: string | null | undefined;
  revocation?: {
    from: string;
    to: string;
  };
};

type GroupedRoleList = {
  providerName: string | null | undefined;
  providerCode: string | null | undefined;
  entries: RoleListEntry[];
};

export const RoleList = ({
  onSelect,
  availableActions,
  isLoading,
  onActionError,
}: RoleListProps) => {
  const { t } = useTranslation();
  const { fromParty, toParty, actingParty, isLoading: partyIsLoading } = usePartyRepresentation();
  const { userID, partyID } = useFetchRecipientInfo(toParty?.partyUuid ?? '', null);
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

  const groupedRoleListEntries = useMemo(() => {
    if (!roleConnections) {
      return [];
    }

    const directMatch = (connection: RoleConnection) =>
      connection.permissions.find(
        (permission) =>
          permission.from?.id === fromParty?.partyUuid && permission.to?.id === toParty?.partyUuid,
      );

    const collator = new Intl.Collator(undefined, { sensitivity: 'base' });

    const providerPriority = (providerCode?: string | null) => {
      if (providerCode === 'sys-ccr') {
        return 0;
      }

      if (providerCode === 'sys-altinn2') {
        return 1;
      }

      return 2;
    };

    const groups = new Map<string, GroupedRoleList>();

    roleConnections.forEach((connection) => {
      const directPermission = directMatch(connection);
      const entry: RoleListEntry = {
        role: connection.role,
        providerCode: connection.role.provider?.code,
        revocation: directPermission
          ? {
              from: directPermission.from.id,
              to: directPermission.to.id,
            }
          : undefined,
      };

      const providerName = connection.role.provider?.name;
      const providerCode = connection.role.provider?.code;
      const groupKey = providerCode ?? providerName ?? 'unknown';

      const group = groups.get(groupKey) ?? {
        providerName,
        providerCode,
        entries: [] as RoleListEntry[],
      };

      group.entries.push(entry);
      group.providerName = group.providerName ?? providerName;
      group.providerCode = group.providerCode ?? providerCode;
      groups.set(groupKey, group);
    });

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        entries: group.entries.sort((a, b) => collator.compare(a.role.name, b.role.name)),
      }))
      .sort((a, b) => {
        const priorityDifference =
          providerPriority(a.providerCode) - providerPriority(b.providerCode);

        if (priorityDifference !== 0) {
          return priorityDifference;
        }

        return collator.compare(a.providerName ?? '', b.providerName ?? '');
      });
  }, [fromParty?.partyUuid, roleConnections, toParty?.partyUuid]);

  const oldSolutionUrl =
    userID && partyID
      ? getRedirectToServicesAvailableForUserUrl(userID, partyID)
      : `${getHostUrl()}ui/profile/`;

  if (partyIsLoading || roleConnectionsIsLoading || isLoading) {
    return <SkeletonRoleList />;
  }

  if (!groupedRoleListEntries.length) {
    return (
      <div className={classes.roleLists}>
        <DsParagraph data-size='sm'>{t('role.no_roles')}</DsParagraph>
      </div>
    );
  }

  return (
    <div className={classes.roleLists}>
      <DsHeading
        level={2}
        data-size='2xs'
        id='access_packages_title'
      >
        {t('role.current_roles_title', { count: roleConnections?.length })}
      </DsHeading>
      <DsParagraph data-size='sm'>
        {t('role.roles_description')}{' '}
        <DsLink asChild>
          <Link to={oldSolutionUrl}>{t('role.roles_description_link_text')}</Link>
        </DsLink>
      </DsParagraph>
      {groupedRoleListEntries.map(({ providerName, providerCode, entries }, index) => {
        const providerTitle = providerName ?? providerCode ?? t('role.other_provider_title');
        const headingId = `role_list_provider_${index}`;

        return (
          <div
            key={`${providerCode ?? providerTitle}-${index}`}
            className={classes.roleArea}
          >
            <DsHeading
              level={3}
              data-size='2xs'
              id={headingId}
            >
              {providerTitle}
            </DsHeading>
            <List aria-labelledby={headingId}>
              {entries.map(({ role, providerCode: entryProviderCode, revocation }) => {
                const showRevokeButton =
                  Boolean(
                    availableActions?.includes(DelegationAction.REVOKE) &&
                      entryProviderCode === 'sys-altinn2' &&
                      revocation,
                  ) && revokeFeatureEnabled;

                return (
                  <RoleListItem
                    key={role.id}
                    role={role}
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
      })}
    </div>
  );
};

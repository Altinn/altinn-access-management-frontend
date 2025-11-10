import { List, DsParagraph, DsHeading, DsAlert } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { Role } from '@/rtk/features/roleApi';
import { useGetRolesForUserQuery } from '@/rtk/features/roleApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { ActionError } from '@/resources/hooks/useActionError';
import { showRolesTab } from '@/resources/utils/featureFlagUtils';

import { DelegationAction } from '../DelegationModal/EditModal';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { RoleListItem } from './RoleListItem';
import { RevokeRoleButton } from './RevokeRoleButton';
import { useGroupedRoleListEntries } from './useGroupedRoleListEntries';
import { TechnicalErrorParagraphs } from '../TechnicalErrorParagraphs';
import { createErrorDetails } from '../TechnicalErrorParagraphs/TechnicalErrorParagraphs';

import classes from './roleSection.module.css';
import { SkeletonRoleList } from './SkeletonRoleList';

interface RoleListProps {
  onSelect: (role: Role) => void;
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
  const { t } = useTranslation();
  const { fromParty, toParty, actingParty, isLoading: partyIsLoading } = usePartyRepresentation();
  const {
    data: roleConnections,
    isLoading: roleConnectionsIsLoading,
    error: roleConnectionsError,
  } = useGetRolesForUserQuery(
    {
      from: fromParty?.partyUuid ?? '',
      to: toParty?.partyUuid ?? '',
      party: actingParty?.partyUuid ?? getCookie('AltinnPartyUuid') ?? '',
    },
    {
      skip: !fromParty?.partyUuid || !toParty?.partyUuid,
    },
  );

  const rolesTabEnabled = showRolesTab();

  const { altinn2Roles } = useGroupedRoleListEntries({
    roleConnections,
    error: roleConnectionsError,
  });

  const roleFetchErrorDetails = createErrorDetails(roleConnectionsError);

  if (partyIsLoading || isLoading || roleConnectionsIsLoading) {
    return <SkeletonRoleList />;
  }

  if (roleConnectionsError) {
    const status = roleFetchErrorDetails?.status ?? '500';
    const time = roleFetchErrorDetails?.time ?? new Date().toISOString();

    return (
      <div className={classes.roleLists}>
        <DsAlert
          data-color='danger'
          data-size='sm'
        >
          <DsHeading
            level={3}
            data-size='2xs'
          >
            {t('role.fetch_error_heading')}
          </DsHeading>
          <TechnicalErrorParagraphs
            size='xs'
            status={status}
            time={time}
            traceId={roleFetchErrorDetails?.traceId}
          />
        </DsAlert>
      </div>
    );
  }

  if (!roleConnectionsIsLoading && altinn2Roles?.length === 0) {
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
        {t('role.current_roles_title', { count: altinn2Roles?.length })}
      </DsHeading>

      <div className={classes.roleArea}>
        <List>
          {altinn2Roles.map(({ role }) => {
            const showRevokeButton =
              fromParty &&
              toParty &&
              rolesTabEnabled &&
              availableActions?.includes(DelegationAction.REVOKE);

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
                      from={fromParty.partyUuid}
                      to={toParty.partyUuid}
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
    </div>
  );
};

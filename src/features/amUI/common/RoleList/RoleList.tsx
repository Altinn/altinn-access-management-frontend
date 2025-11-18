import type { Role } from '@/rtk/features/roleApi';
import { useGetRolePermissionsQuery } from '@/rtk/features/roleApi';
import type { ActionError } from '@/resources/hooks/useActionError';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { SkeletonRoleList } from './SkeletonRoleList';
import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { useGroupedRoleListEntries } from './useGroupedRoleListEntries';
import { DsAlert, DsHeading, DsParagraph, List } from '@altinn/altinn-components';
import { t } from 'i18next';
import { RoleListItem } from './RoleListItem';
import classes from './roleSection.module.css';

interface RoleListProps {
  onSelect: (role: Role) => void;
  isLoading?: boolean;
}

export const RoleList = ({ onSelect, isLoading }: RoleListProps) => {
  const { fromParty, toParty, actingParty, isLoading: partyIsLoading } = usePartyRepresentation();
  const {
    data: permissions,
    isLoading: permissionsIsLoading,
    error: permissionsError,
  } = useGetRolePermissionsQuery({
    party: actingParty?.partyUuid ?? '',
    from: fromParty?.partyUuid,
    to: toParty?.partyUuid,
  });

  const { altinn2Roles } = useGroupedRoleListEntries({
    permissions,
  });

  if (permissionsIsLoading || partyIsLoading || isLoading) {
    return <SkeletonRoleList />;
  }
  if (permissionsError) {
    const roleFetchErrorDetails = createErrorDetails(permissionsError);

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
          <DsParagraph data-size='sm'>{t('role.fetch_error_description')}</DsParagraph>
          <TechnicalErrorParagraphs
            size='xs'
            status={roleFetchErrorDetails?.status ?? ''}
            time={roleFetchErrorDetails?.time ?? ''}
            traceId={roleFetchErrorDetails?.traceId ?? ''}
          />
        </DsAlert>
      </div>
    );
  }
  return (
    <div className={classes.roleArea}>
      <DsHeading
        level={2}
        data-size='xs'
      >
        {t('role.current_roles_title', { count: altinn2Roles.length })}
      </DsHeading>
      {altinn2Roles.length === 0 ? (
        <DsParagraph data-size='sm'>{t('role.no_roles_message')}</DsParagraph>
      ) : (
        <List>
          {altinn2Roles.map(({ role }) => {
            return (
              <RoleListItem
                key={role.id}
                role={role}
                onClick={() => onSelect(role)}
              />
            );
          })}
        </List>
      )}
    </div>
  );
};

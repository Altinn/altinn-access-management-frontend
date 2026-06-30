import type { Role } from '@/rtk/features/roleApi';
import { useGetRolePermissionsQuery } from '@/rtk/features/roleApi';
import { enableRoleDeletion } from '@/resources/utils/featureFlagUtils';
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
import { useRoleMetadata } from '../UserRoles/useRoleMetadata';
import { RoleDeleteButton } from './RoleDeleteButton';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import { useRestoreFocusOnDataChange } from '../RestoreFocus';

export const ROLE_LIST_HEADING_ID = 'role_list_heading';

interface RoleListProps {
  onSelect: (role: Role, error?: unknown) => void;
  isLoading?: boolean;
}

export const RoleList = ({ onSelect, isLoading }: RoleListProps) => {
  const { fromParty, toParty, actingParty, isLoading: partyIsLoading } = usePartyRepresentation();
  const {
    data: permissions,
    isLoading: permissionsIsLoading,
    error: permissionsError,
  } = useGetRolePermissionsQuery(
    {
      party: actingParty?.partyUuid ?? '',
      from: fromParty?.partyUuid,
      to: toParty?.partyUuid,
    },
    {
      skip: !actingParty?.partyUuid || !fromParty?.partyUuid || !toParty?.partyUuid,
    },
  );

  const enableRoleDeletionFlag = enableRoleDeletion();
  const isMobileOrSmaller = useIsMobileOrSmaller();

  const {
    mapRoles,
    error: roleMetadataError,
    isLoading: roleMetadataIsLoading,
  } = useRoleMetadata();

  const { altinn2Roles } = useGroupedRoleListEntries({
    permissions,
  });

  const requestFocusOnDataChange = useRestoreFocusOnDataChange(permissions);

  const mappedRoles = mapRoles(altinn2Roles?.map(({ role }) => role ?? ([] as Role[])));

  if (permissionsIsLoading || partyIsLoading || roleMetadataIsLoading || isLoading) {
    return <SkeletonRoleList />;
  }
  if (permissionsError || roleMetadataError) {
    const roleFetchErrorDetails = createErrorDetails(permissionsError || roleMetadataError);

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
        id={ROLE_LIST_HEADING_ID}
      >
        {t('role.current_roles_title', { count: mappedRoles.length })}
      </DsHeading>
      {mappedRoles.length === 0 ? (
        <DsParagraph>{t('role.no_roles_message')}</DsParagraph>
      ) : (
        <List>
          {mappedRoles.map((role) => {
            const rolePermissions = permissions?.find((p) => p.role?.id === role.id);
            const isRoleDeletable = rolePermissions?.role?.isRevocable ?? false;
            return (
              <RoleListItem
                key={role.id}
                role={role}
                onClick={() => onSelect(role)}
                deleteButton={
                  enableRoleDeletionFlag && isRoleDeletable && !isMobileOrSmaller ? (
                    <RoleDeleteButton
                      role={role}
                      variant='tertiary'
                      color='neutral'
                      size='sm'
                      icon={true}
                      onSuccess={() => requestFocusOnDataChange(role.id, ROLE_LIST_HEADING_ID)}
                      onError={(error) => onSelect(role, error)}
                    />
                  ) : undefined
                }
              />
            );
          })}
        </List>
      )}
    </div>
  );
};

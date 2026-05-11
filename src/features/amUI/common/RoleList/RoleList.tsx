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
import { getInheritedStatus } from '../useInheritedStatus';

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

  const {
    mapRoles,
    error: roleMetadataError,
    isLoading: roleMetadataIsLoading,
  } = useRoleMetadata();

  const { altinn2Roles } = useGroupedRoleListEntries({
    permissions,
  });

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
      >
        {t('role.current_roles_title', { count: mappedRoles.length })}
      </DsHeading>
      {mappedRoles.length === 0 ? (
        <DsParagraph>{t('role.no_roles_message')}</DsParagraph>
      ) : (
        <List>
          {mappedRoles.map((role) => {
            const permissionsForRole = permissions?.filter((p) => p.role?.id === role.id) ?? [];
            console.log('Permissions for role', role.name, permissionsForRole);
            const isInherited =
              getInheritedStatus({
                permissions: permissionsForRole,
                toParty,
                fromParty,
                actingParty,
              }).length > 0;
            return (
              <RoleListItem
                key={role.id}
                role={role}
                onClick={() => onSelect(role)}
                deleteButton={
                  enableRoleDeletionFlag && isInherited ? (
                    <button onClick={() => console.log('Delete role', role.id)}>Delete</button>
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

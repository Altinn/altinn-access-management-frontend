import { useTranslation } from 'react-i18next';
import classes from './RoleInfo.module.css';
import {
  Role,
  useGetRolePermissionsQuery,
  useGetRoleResourcesQuery,
  useRemoveRoleMutation,
} from '@/rtk/features/roleApi';
import { DsButton, DsHeading, DsLink, DsParagraph } from '@altinn/altinn-components';
import {
  ExclamationmarkTriangleFillIcon,
  InformationSquareFillIcon,
  ExternalLinkIcon,
} from '@navikt/aksel-icons';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { getRedirectToA2UsersListSectionUrl } from '@/resources/utils';
import { RoleResourcesSection } from './RoleResourcesSection';
import { RoleStatusMessage } from './RoleStatusMessages';
import { enableRoleDeletion } from '@/resources/utils/featureFlagUtils';

export interface PackageInfoProps {
  role: Role;
}

export const RoleInfo = ({ role }: PackageInfoProps) => {
  const { t } = useTranslation();

  const isExternalRole = role?.provider?.code === 'sys-ccr';
  const isLegacyRole = role?.provider?.code === 'sys-altinn2';
  const enableRoleDeletionFlag = enableRoleDeletion();

  const { fromParty, actingParty, toParty } = usePartyRepresentation();
  const shouldSkipRoleRefs = !role?.code || !fromParty?.variant;
  const { data: roleResources, isLoading: isRoleResourcesLoading } = useGetRoleResourcesQuery(
    { roleCode: role.code ?? '', variant: fromParty?.variant || '' },
    { skip: shouldSkipRoleRefs },
  );
  const { data: permissions } = useGetRolePermissionsQuery(
    {
      party: actingParty?.partyUuid ?? '',
      from: fromParty?.partyUuid,
      to: toParty?.partyUuid,
    },
    {
      skip: !actingParty?.partyUuid || !fromParty?.partyUuid || !toParty?.partyUuid,
    },
  );

  const [removeRole] = useRemoveRoleMutation();

  const sectionId = fromParty?.partyUuid === actingParty?.partyUuid ? 9 : 8;
  const oldSolutionUrl = getRedirectToA2UsersListSectionUrl(sectionId);
  const hasRole = permissions?.some((permission) => permission.role?.code === role.code);
  const isRoleDeletable = true; // TODO: Update this logic when backend gives more information about deletable roles

  const handleDeleteRole = () => {
    if (!fromParty || !toParty) {
      console.error('Missing fromParty or toParty information');
      return;
    }
    removeRole({
      roleCode: role.code,
      from: fromParty.partyUuid,
      to: toParty.partyUuid,
      party: actingParty?.partyUuid ?? '',
    })
      .unwrap()
      .then(() => {})
      .catch((error) => {
        console.error('Failed to remove role:', error);
      });
  };

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <DsHeading
          level={2}
          data-size='sm'
        >
          {role?.name}
        </DsHeading>
      </div>
      <div className={classes.infoContainer}>
        {isLegacyRole && (
          <div className={classes.infoLine}>
            <ExclamationmarkTriangleFillIcon
              fontSize='1.5rem'
              className={classes.warningIcon}
            />
            <DsParagraph data-size='xs'>{t('a2Alerts.legacyRoleContent')}</DsParagraph>
          </div>
        )}
        {isExternalRole && (
          <div className={classes.infoLine}>
            <InformationSquareFillIcon
              fontSize='1.5rem'
              className={classes.inheritedInfoIcon}
            />
            <DsParagraph data-size='xs'>
              {t('role.provider_status')}
              {role?.provider?.name}
            </DsParagraph>
          </div>
        )}
        <RoleStatusMessage role={role} />
      </div>
      <DsParagraph>{role?.description}</DsParagraph>
      <DsParagraph className={classes.oldRolesDisclaimer}>
        {t('role.resources_disclaimer')}{' '}
        <DsLink asChild>
          <a
            href={oldSolutionUrl}
            target='_blank'
            rel='noopener noreferrer'
          >
            {t('role.resources_disclaimer_link')}
            <ExternalLinkIcon aria-hidden />
          </a>
        </DsLink>
      </DsParagraph>
      {!shouldSkipRoleRefs && (
        <RoleResourcesSection
          roleResources={roleResources}
          isLoading={isRoleResourcesLoading}
        />
      )}
      {hasRole && enableRoleDeletionFlag && isRoleDeletable && (
        <div>
          <DsButton
            data-color={'danger'}
            variant='secondary'
            onClick={handleDeleteRole}
          >
            {t('common.delete_poa')}
          </DsButton>
        </div>
      )}
    </div>
  );
};

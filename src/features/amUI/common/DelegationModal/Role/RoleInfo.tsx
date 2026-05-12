import { useTranslation } from 'react-i18next';
import classes from './RoleInfo.module.css';
import {
  Role,
  useGetRolePermissionsQuery,
  useGetRoleResourcesQuery,
  useRemoveRoleMutation,
} from '@/rtk/features/roleApi';
import {
  DsAlert,
  DsHeading,
  DsLink,
  DsParagraph,
  DsSpinner,
  useSnackbar,
} from '@altinn/altinn-components';
import { DeletePoaConfirmation } from '@/features/amUI/common/DeletePoaConfirmation/DeletePoaConfirmation';
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
import { useState } from 'react';
import { TechnicalErrorParagraphs } from '../../TechnicalErrorParagraphs';
import { createErrorDetails } from '../../TechnicalErrorParagraphs/TechnicalErrorParagraphs';

export interface PackageInfoProps {
  role: Role;
}

export const RoleInfo = ({ role }: PackageInfoProps) => {
  const { t } = useTranslation();
  const [isDeleteError, setDeleteIsError] = useState(false);

  const isExternalRole = role?.provider?.code === 'sys-ccr';
  const isLegacyRole = role?.provider?.code === 'sys-altinn2';
  const enableRoleDeletionFlag = enableRoleDeletion();
  const { openSnackbar } = useSnackbar();

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

  const [removeRole, { isLoading: isRemoveRoleLoading, error: removeRoleError }] =
    useRemoveRoleMutation();

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
      .then(() => {
        openSnackbar({ message: t('role.delete_role_success'), color: 'success' });
      })
      .catch((error) => {
        setDeleteIsError(true);
      });
  };

  const deleteErrorAlert = () => {
    if (removeRoleError) {
      const details = createErrorDetails(removeRoleError);
      return (
        <>
          {!!details && (
            <DsAlert data-color='danger'>
              <DsParagraph>
                {t('client_administration_page.load_user_delegations_error')}
              </DsParagraph>
              <TechnicalErrorParagraphs
                status={details.status}
                time={details.time}
                traceId={details.traceId}
              />
            </DsAlert>
          )}
        </>
      );
    }
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
      <div aria-live='polite'>{isDeleteError && deleteErrorAlert()}</div>
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
        <div className={classes.deleteRoleButtonContainer}>
          <DeletePoaConfirmation
            warningText={t('role.delete_role_confirmation')}
            handleDeletion={handleDeleteRole}
            isDeleteLoading={isRemoveRoleLoading}
            loadingAriaLabel={t('role.deleting_role_loading')}
          />
        </div>
      )}
    </div>
  );
};

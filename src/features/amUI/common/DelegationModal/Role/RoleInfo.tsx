import { useTranslation } from 'react-i18next';
import classes from './RoleInfo.module.css';
import { Role, useGetRolePermissionsQuery, useGetRoleResourcesQuery } from '@/rtk/features/roleApi';
import { DsAlert, DsHeading, DsParagraph } from '@altinn/altinn-components';
import { RoleDeleteButton } from '@/features/amUI/common/RoleList/RoleDeleteButton';
import { ExclamationmarkTriangleFillIcon, InformationSquareFillIcon } from '@navikt/aksel-icons';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { RoleResourcesSection } from './RoleResourcesSection';
import { RoleStatusMessage } from './RoleStatusMessages';
import { enableRoleDeletion } from '@/resources/utils/featureFlagUtils';
import { useState } from 'react';
import { TechnicalErrorParagraphs } from '../../TechnicalErrorParagraphs';
import { createErrorDetails } from '../../TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { useDelegationModalContext } from '../DelegationModalContext';
import { useRestoreFocusOnDataChange, useRestoreFocusTarget } from '../../RestoreFocus';

export const ROLE_MODAL_HEADING_ID = 'role_modal_heading';

export interface RoleInfoProps {
  role: Role;
}

export const RoleInfo = ({ role }: RoleInfoProps) => {
  const { t } = useTranslation();
  const [deleteError, setDeleteError] = useState<unknown>(null);
  useRestoreFocusTarget(ROLE_MODAL_HEADING_ID);

  const isExternalRole = role?.provider?.code === 'sys-ccr';
  const isLegacyRole = role?.provider?.code === 'sys-altinn2';
  const enableRoleDeletionFlag = enableRoleDeletion();

  const { actionError } = useDelegationModalContext();

  const { fromParty, actingParty, toParty } = usePartyRepresentation();
  const shouldSkipRoleRefs = !role?.code || !fromParty?.variant;
  const { data: roleResources, isLoading: isRoleResourcesLoading } = useGetRoleResourcesQuery(
    { roleCode: role.code ?? '', variant: fromParty?.variant || '' },
    { skip: shouldSkipRoleRefs },
  );
  const { data: permissions, isLoading: isPermissionsLoading } = useGetRolePermissionsQuery(
    {
      party: actingParty?.partyUuid ?? '',
      from: fromParty?.partyUuid,
      to: toParty?.partyUuid,
    },
    {
      skip: !actingParty?.partyUuid || !fromParty?.partyUuid || !toParty?.partyUuid,
    },
  );

  // restore focus only when the permissions query refetches
  const requestFocusOnDataChange = useRestoreFocusOnDataChange(permissions);

  const rolePermissions = permissions?.find((p) => p.role?.id === role.id);
  const hasRole = rolePermissions !== undefined;
  const roleIsRevocable = rolePermissions?.role?.isRevocable ?? false;

  const deleteErrorAlert = () => {
    if (deleteError || actionError) {
      const error = deleteError || actionError;
      const details = createErrorDetails(error as Parameters<typeof createErrorDetails>[0]);
      return (
        <>
          {!!details && (
            <DsAlert data-color='danger'>
              <DsParagraph>{t('role.delete_role_error')}</DsParagraph>
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
          id={ROLE_MODAL_HEADING_ID}
          level={2}
          data-size='sm'
          // Programmatically focusable so it can hold focus when the delete button is removed.
          tabIndex={-1}
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
              aria-hidden='true'
            />
            <DsParagraph data-size='xs'>{t('a2Alerts.legacyRoleContent')}</DsParagraph>
          </div>
        )}
        {isExternalRole && (
          <div className={classes.infoLine}>
            <InformationSquareFillIcon
              fontSize='1.5rem'
              className={classes.inheritedInfoIcon}
              aria-hidden='true'
            />
            <DsParagraph data-size='xs'>
              {t('role.provider_status')}
              {role?.provider?.name}
            </DsParagraph>
          </div>
        )}
        <RoleStatusMessage role={role} />
      </div>
      <div aria-live='polite'>{(!!deleteError || !!actionError) && deleteErrorAlert()}</div>
      <DsParagraph>{role?.description}</DsParagraph>
      {!shouldSkipRoleRefs && (
        <RoleResourcesSection
          roleResources={roleResources}
          isLoading={isRoleResourcesLoading}
        />
      )}
      {hasRole && enableRoleDeletionFlag && (
        <div className={classes.deleteRoleButtonContainer}>
          <RoleDeleteButton
            role={role}
            onSuccess={() => requestFocusOnDataChange(ROLE_MODAL_HEADING_ID)}
            onError={setDeleteError}
            disabled={!roleIsRevocable}
          />
        </div>
      )}
      {!hasRole && enableRoleDeletionFlag && !isPermissionsLoading && (
        <div className={classes.deleteRoleButtonContainer}>
          <DsParagraph data-size='md'>{t('role.cannot_assign_role_poa')}</DsParagraph>
        </div>
      )}
    </div>
  );
};

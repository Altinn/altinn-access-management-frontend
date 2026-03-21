import * as React from 'react';
import { Button, DsParagraph, formatDisplayName } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { MinusCircleIcon } from '@navikt/aksel-icons';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import type { Party } from '@/rtk/features/lookupApi';

type ToParty = Pick<Party, 'partyUuid' | 'name' | 'partyTypeName'>;
import { StatusMessageForScreenReader } from '@/components/StatusMessageForScreenReader/StatusMessageForScreenReader';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import { PartyType } from '@/rtk/features/userInfoApi';

import { StatusSection } from '../../StatusSection/StatusSection';
import { LoadingAnimation } from '../../LoadingAnimation/LoadingAnimation';
import { ResourceHeading } from '../SingleRights/ResourceHeading';
import { RightsSection } from '../SingleRights/RightsSection';
import { ResourceAlert } from '../SingleRights/ResourceAlert';
import { ResourceInfoSkeleton } from '../SingleRights/ResourceInfoSkeleton';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { DelegationAction } from '../EditModal';
import { useInstanceRightsSection } from './useInstanceRightsSection';

import classes from '../SingleRights/ResourceInfo.module.css';

export interface InstanceInfoProps {
  resource: ServiceResource;
  instanceUrn: string;
  instanceName?: string;
  toParty?: ToParty;
  availableActions?: DelegationAction[];
  onSuccess?: () => void;
}

export const InstanceInfo = ({
  resource,
  instanceUrn,
  instanceName,
  toParty: toPartyProp,
  availableActions,
  onSuccess,
}: InstanceInfoProps) => {
  const { t } = useTranslation();
  const isSmall = useIsMobileOrSmaller();
  const { toParty: toPartyContext } = usePartyRepresentation();

  const toParty = toPartyProp ?? toPartyContext;

  const toName = formatDisplayName({
    fullName: toParty?.name ?? '',
    type: toParty?.partyTypeName === PartyType.Organization ? 'company' : 'person',
  });

  const hasDelegateAction = availableActions?.includes(DelegationAction.DELEGATE);
  const canRevoke = availableActions?.includes(DelegationAction.REVOKE) ?? false;

  const {
    rights,
    setRights,
    saveEditedRights,
    delegateChosenRights,
    revokeResource,
    undelegableActions,
    hasUnsavedChanges,
    hasAccess,
    hasDirectAccess,
    isDelegationCheckLoading,
    isDelegationCheckError,
    delegationError,
    missingAccess,
    isLoading,
    isActionLoading,
    isActionSuccess,
    technicalErrorDetails,
  } = useInstanceRightsSection({
    resource,
    instanceUrn,
    toPartyUuid: toParty?.partyUuid,
    onSuccess,
    mode: canRevoke ? 'edit' : 'delegate',
  });

  const hasDelegableRights = rights.some((r) => r.delegable);
  const showMissingRightsStatus = !hasAccess && rights.length > 0 && !hasDelegableRights;
  const cannotDelegateHere = resource?.delegable === false;

  const displayResourceAlert =
    !!technicalErrorDetails ||
    (hasDelegateAction &&
      !hasAccess &&
      (isDelegationCheckError ||
        resource?.delegable === false ||
        (rights.length > 0 && !rights.some((r) => r.delegable === true))));

  const shortId = instanceUrn.slice(-10);

  return (
    <>
      <StatusMessageForScreenReader politenessSetting='assertive'>
        {delegationError
          ? delegationError === 'revoke'
            ? t('delegation_modal.technical_error_message.revoke_failed')
            : t('delegation_modal.technical_error_message.message')
          : (missingAccess ?? '')}
      </StatusMessageForScreenReader>
      <div>
        <ResourceHeading resource={resource} />
        {isActionLoading || isActionSuccess ? (
          <LoadingAnimation
            isLoading={isActionLoading}
            displaySuccess={isActionSuccess}
          />
        ) : isLoading ? (
          <ResourceInfoSkeleton />
        ) : (
          <>
            <div
              className={classes.resourceInfo}
              data-size={isSmall ? 'xs' : 'md'}
            >
              <DsParagraph data-size='sm'>
                {instanceName ? `${instanceName} (${shortId})` : shortId}
              </DsParagraph>
              <StatusSection
                userHasAccess={hasAccess}
                showDelegationCheckWarning={showMissingRightsStatus}
                cannotDelegateHere={cannotDelegateHere}
              />
              {resource.description && <DsParagraph>{resource.description}</DsParagraph>}
            </div>
            {displayResourceAlert ? (
              <ResourceAlert
                error={technicalErrorDetails}
                rightReasons={rights.map((r) => r.delegationReason)}
                resource={resource}
                className={classes.resourceAlert}
              />
            ) : (
              <RightsSection
                rights={rights}
                setRights={setRights}
                undelegableActions={undelegableActions}
                isDelegationCheckLoading={isDelegationCheckLoading}
                toName={toName}
                availableActions={availableActions}
                delegationError={delegationError}
                missingAccess={missingAccess && hasDelegateAction ? missingAccess : null}
                hasAccessAndNoChanges={hasDirectAccess && !hasUnsavedChanges}
              />
            )}
            <div className={classes.editButtons}>
              {hasDelegateAction && (
                <Button
                  data-size='sm'
                  disabled={
                    displayResourceAlert ||
                    !rights.some((r) => r.checked === true) ||
                    !hasUnsavedChanges
                  }
                  onClick={hasDirectAccess ? saveEditedRights : delegateChosenRights}
                >
                  {hasDirectAccess ? t('common.update_poa') : t('common.give_poa')}
                </Button>
              )}
              {canRevoke && hasDirectAccess && !!toParty && (
                <Button
                  variant={hasDelegateAction ? 'tertiary' : 'primary'}
                  onClick={revokeResource}
                  disabled={!rights.some((r) => r.delegated === true && r.inherited !== true)}
                  color='danger'
                >
                  <MinusCircleIcon aria-hidden='true' />
                  {t('common.delete_poa')}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

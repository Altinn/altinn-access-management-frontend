import * as React from 'react';
import { Button, DsButton, DsParagraph, formatDisplayName } from '@altinn/altinn-components';

import {
  useGetSingleRightsForRightholderQuery,
  type ServiceResource,
} from '@/rtk/features/singleRights/singleRightsApi';
import { StatusMessageForScreenReader } from '@/components/StatusMessageForScreenReader/StatusMessageForScreenReader';

import { StatusSection } from '../../StatusSection/StatusSection';
import { useRightsSection } from './hooks/useRightsSection';
import { LoadingAnimation } from '../../LoadingAnimation/LoadingAnimation';
import { ResourceHeading } from './ResourceHeading';
import { ResourceInfoSkeleton } from './ResourceInfoSkeleton';

import classes from './ResourceInfo.module.css';
import { useInheritedStatusInfo } from '../../useInheritedStatus';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { DelegationAction } from '../EditModal';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import { useTranslation } from 'react-i18next';
import { PartyType } from '@/rtk/features/userInfoApi';
import { createErrorDetails } from '../../TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { ResourceAlert } from './ResourceAlert';
import { MinusCircleIcon } from '@navikt/aksel-icons';
import { RightsSection } from './RightsSection';

export interface ResourceInfoProps {
  resource: ServiceResource;
  onDelegate?: () => void;
  availableActions?: DelegationAction[];
}

export const ResourceInfo = ({ resource, onDelegate, availableActions }: ResourceInfoProps) => {
  const isSmall = useIsMobileOrSmaller();

  const { t } = useTranslation();
  const { actingParty, fromParty, toParty } = usePartyRepresentation();
  const { data: resourceDelegations, isLoading: isResourceDelegationsLoading } =
    useGetSingleRightsForRightholderQuery(
      {
        actingParty: actingParty?.partyUuid || '',
        from: fromParty?.partyUuid || '',
        to: toParty?.partyUuid || '',
      },
      {
        skip: !actingParty || !fromParty || !toParty,
      },
    );

  const isSingleRightRequest = availableActions?.includes(DelegationAction.REQUEST);
  const hasDelegateAction = availableActions?.includes(DelegationAction.DELEGATE);

  const {
    rights,
    setRights,
    saveEditedRights,
    delegateChosenRights,
    revokeResource,
    undelegableActions,
    hasUnsavedChanges,
    hasAccess,
    isDelegationCheckLoading,
    isDelegationCheckError,
    delegationCheckError,
    delegationError,
    missingAccess,
    isLoading: isRightsSectionLoading,
    isActionLoading,
    isActionSuccess,
    rightsMetaTechnicalErrorDetails,
    createRequest,
    deleteRequest,
    hasPendingRequest,
    isLoadingRequest,
  } = useRightsSection({ resource, isRequest: isSingleRightRequest, onDelegate });

  const hasDelegableRights = rights.some((r) => r.delegable);
  const showMissingRightsStatus =
    !hasAccess && rights.length > 0 && !hasDelegableRights && !isSingleRightRequest;
  const cannotDelegateHere = resource?.delegable === false && !isSingleRightRequest;
  const cannotRequestRight = resource?.delegable === false && isSingleRightRequest;
  const resourcePermissions =
    resourceDelegations?.find(
      (delegation) => delegation.resource.identifier === resource.identifier,
    )?.permissions || [];

  const toName = formatDisplayName({
    fullName: toParty?.name ?? '',
    type: toParty?.partyTypeName === PartyType.Organization ? 'company' : 'person',
  });
  const displayResourceAlert =
    (isSingleRightRequest && resource?.delegable === false) ||
    !!rightsMetaTechnicalErrorDetails ||
    (hasDelegateAction &&
      !hasAccess &&
      (isDelegationCheckError ||
        resource?.delegable === false ||
        (rights.length > 0 && !rights.some((r) => r.delegable === true))));

  const delegationCheckErrorDetails = isDelegationCheckError
    ? createErrorDetails(delegationCheckError)
    : null;

  const technicalErrorDetails = rightsMetaTechnicalErrorDetails ?? delegationCheckErrorDetails;

  const inheritedStatus = useInheritedStatusInfo({
    permissions: resourcePermissions,
    toParty,
    fromParty,
    actingParty,
  });
  const isLoadingSingleRightRequest = isLoadingRequest(resource.identifier);

  return (
    <>
      <StatusMessageForScreenReader politenessSetting='assertive'>
        {delegationError ?? missingAccess ?? ''}
      </StatusMessageForScreenReader>
      <div>
        <ResourceHeading resource={resource} />
        {isActionLoading || isActionSuccess ? (
          <LoadingAnimation
            isLoading={isActionLoading}
            displaySuccess={isActionSuccess}
          />
        ) : isRightsSectionLoading || isResourceDelegationsLoading ? (
          <ResourceInfoSkeleton />
        ) : (
          <>
            <div
              className={classes.resourceInfo}
              data-size={isSmall ? 'xs' : 'md'}
            >
              <StatusSection
                userHasAccess={hasAccess}
                showDelegationCheckWarning={showMissingRightsStatus}
                inheritedStatus={inheritedStatus}
                cannotDelegateHere={cannotDelegateHere}
                cannotRequestRight={cannotRequestRight}
                isPendingRequest={hasPendingRequest(resource.identifier)}
              />
              {resource.description && <DsParagraph>{resource.description}</DsParagraph>}
              {resource.rightDescription && <DsParagraph>{resource.rightDescription}</DsParagraph>}
            </div>
            {displayResourceAlert ? (
              <ResourceAlert
                error={technicalErrorDetails}
                isRequest={isSingleRightRequest}
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
                isSingleRightRequest={isSingleRightRequest}
                availableActions={availableActions}
                delegationError={delegationError}
                missingAccess={missingAccess && hasDelegateAction ? missingAccess : null}
                hasAccessAndNoChanges={hasAccess && !hasUnsavedChanges}
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
                  onClick={hasAccess ? saveEditedRights : delegateChosenRights}
                >
                  {hasAccess ? t('common.update_poa') : t('common.give_poa')}
                </Button>
              )}
              {hasAccess && toParty && (
                <Button
                  variant={hasDelegateAction ? 'tertiary' : 'primary'}
                  onClick={revokeResource}
                  disabled={rights.length === 0 || rights.some((r) => r.inherited === true)}
                  color='danger'
                >
                  <MinusCircleIcon aria-hidden='true' />
                  {t('common.delete_poa')}
                </Button>
              )}
              {!hasAccess && !hasPendingRequest(resource.identifier) && isSingleRightRequest && (
                <DsButton
                  data-size='sm'
                  disabled={displayResourceAlert || isLoadingSingleRightRequest}
                  loading={isLoadingSingleRightRequest}
                  onClick={() => createRequest(resource)}
                >
                  {t('common.request_poa')}
                </DsButton>
              )}
              {hasPendingRequest(resource.identifier) && isSingleRightRequest && (
                <DsButton
                  data-size='sm'
                  disabled={isLoadingSingleRightRequest}
                  data-color='danger'
                  loading={isLoadingSingleRightRequest}
                  onClick={() => deleteRequest(resource)}
                >
                  {t('delegation_modal.request.delete_request')}
                </DsButton>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

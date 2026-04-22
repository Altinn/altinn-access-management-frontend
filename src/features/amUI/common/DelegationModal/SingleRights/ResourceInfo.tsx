import * as React from 'react';
import { Button, DsButton, DsParagraph, formatDisplayName } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { MinusCircleIcon } from '@navikt/aksel-icons';

import {
  useGetSingleRightsForRightholderQuery,
  type ServiceResource,
} from '@/rtk/features/singleRights/singleRightsApi';
import { useGetReporteeQuery, PartyType } from '@/rtk/features/userInfoApi';
import { useDelegateRights } from '@/resources/hooks/useDelegateRights';
import { useUpdateResource } from '@/resources/hooks/useUpdateResource';
import { useRevokeResource } from '@/resources/hooks/useRevokeResource';
import { StatusMessageForScreenReader } from '@/components/StatusMessageForScreenReader/StatusMessageForScreenReader';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import { createErrorDetails } from '../../TechnicalErrorParagraphs/TechnicalErrorParagraphs';

import { StatusSection } from '../../StatusSection/StatusSection';
import { LoadingAnimation } from '../../LoadingAnimation/LoadingAnimation';
import { useInheritedStatusInfo } from '../../useInheritedStatus';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { getMissingAccessMessage } from '../missingAccessUtils';
import { useRightsSection } from '../utils/useRightsSection';
import { DelegationAction } from '../EditModal';
import { ResourceHeading } from './ResourceHeading';
import { ResourceInfoSkeleton } from './ResourceInfoSkeleton';
import { ResourceAlert } from './ResourceAlert';
import { RightsSection } from './RightsSection';
import { useSingleRightsDelegationRightsData } from './hooks/useSingleRightsDelegationRightsData';
import { useSingleRightRequests } from './hooks/useSingleRightRequests';

import classes from './ResourceInfo.module.css';

export interface ResourceInfoProps {
  resource: ServiceResource;
  onDelegate?: () => void;
  availableActions?: DelegationAction[];
  // Optional for the single right request flow, where there may not be a toParty in context
  toPartyName?: string;
}

export const ResourceInfo = ({
  resource,
  onDelegate,
  availableActions,
  toPartyName,
}: ResourceInfoProps) => {
  const isSmall = useIsMobileOrSmaller();
  const { t } = useTranslation();
  const { actingParty, fromParty, toParty } = usePartyRepresentation();

  const isSingleRightRequest = availableActions?.includes(DelegationAction.REQUEST);
  const hasDelegateAction = availableActions?.includes(DelegationAction.DELEGATE);
  const hasApproveAction = availableActions?.includes(DelegationAction.APPROVE);

  const { data: resourceDelegations, isLoading: isResourceDelegationsLoading } =
    useGetSingleRightsForRightholderQuery(
      {
        actingParty: actingParty?.partyUuid || '',
        from: fromParty?.partyUuid || '',
        to: toParty?.partyUuid || '',
      },
      { skip: !actingParty || !fromParty || !toParty },
    );

  const {
    rights,
    setRights,
    hasAccess,
    isLoading: isRightsSectionLoading,
    isDelegationCheckLoading,
    isDelegationCheckError,
    delegationCheckError,
    delegationCheckedActions,
    rightsMetaTechnicalErrorDetails,
  } = useSingleRightsDelegationRightsData({ resource, isRequest: isSingleRightRequest });

  const { createRequest, deleteRequest, hasPendingRequest, isLoadingRequest } =
    useSingleRightRequests({
      canRequestRights: isSingleRightRequest,
      actingPartyUuid: actingParty?.partyUuid,
      fromPartyUuid: fromParty?.partyUuid,
    });

  const delegateRights = useDelegateRights();
  const updateResource = useUpdateResource();
  const revokeRight = useRevokeResource();

  const {
    delegateChosenRights,
    saveEditedRights,
    revokeResource,
    hasUnsavedChanges,
    undelegableActions,
    delegationError,
    isActionLoading,
    isActionSuccess,
  } = useRightsSection({
    rights,
    onDelegate,
    actions: {
      delegate: (actionKeys, onSuccess, onError) =>
        delegateRights(actionKeys, resource.identifier, onSuccess, onError),
      update: (actionKeys, onSuccess, onError) =>
        updateResource(resource.identifier, actionKeys, onSuccess, onError),
      revoke: (onSuccess, onError) => revokeRight(resource.identifier, onSuccess, onError),
    },
  });

  const { data: reportee } = useGetReporteeQuery();

  const rawMissingAccess = delegationCheckedActions
    ? getMissingAccessMessage(
        delegationCheckedActions,
        t,
        resource?.resourceOwnerName,
        reportee?.name,
      )
    : null;
  const missingAccess = isActionLoading || delegationError ? null : rawMissingAccess;

  const delegationCheckErrorDetails = isDelegationCheckError
    ? createErrorDetails(delegationCheckError)
    : null;
  const technicalErrorDetails = rightsMetaTechnicalErrorDetails ?? delegationCheckErrorDetails;

  const inheritedStatus = useInheritedStatusInfo({
    permissions:
      resourceDelegations?.find((d) => d.resource.identifier === resource.identifier)
        ?.permissions || [],
    toParty,
    fromParty,
    actingParty,
  });

  const toName =
    toPartyName ??
    formatDisplayName({
      fullName: toParty?.name ?? '',
      type: toParty?.partyTypeName === PartyType.Organization ? 'company' : 'person',
    });

  const hasDelegableRights = rights.some((r) => r.delegable);
  const showMissingRightsStatus =
    !hasAccess && rights.length > 0 && !hasDelegableRights && !isSingleRightRequest;
  const cannotDelegateHere = resource?.delegable === false && !isSingleRightRequest;
  const cannotRequestRight = resource?.delegable === false && isSingleRightRequest;

  const displayResourceAlert =
    (isSingleRightRequest && resource?.delegable === false) ||
    !!technicalErrorDetails ||
    (hasApproveAction && !hasAccess && missingAccess) ||
    ((hasDelegateAction || hasApproveAction) &&
      !hasAccess &&
      (isDelegationCheckError ||
        resource?.delegable === false ||
        (rights.length > 0 && !rights.some((r) => r.delegable === true))));

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
                availableActions={availableActions}
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
                hasAccessAndNoChanges={hasAccess && !hasUnsavedChanges}
              />
            )}
            <div className={classes.editButtons}>
              {hasDelegateAction && (
                <Button
                  data-size='sm'
                  disabled={
                    !!displayResourceAlert ||
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
                  disabled={!!displayResourceAlert || isLoadingSingleRightRequest}
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

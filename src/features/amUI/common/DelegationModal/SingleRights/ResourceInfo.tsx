import { DsButton, DsParagraph } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import {
  useGetSingleRightsForRightholderQuery,
  type ServiceResource,
} from '@/rtk/features/singleRights/singleRightsApi';
import { useDelegateRights } from '@/resources/hooks/useDelegateRights';
import { useUpdateResource } from '@/resources/hooks/useUpdateResource';
import { useRevokeResource } from '@/resources/hooks/useRevokeResource';

import { StatusSection } from '../../StatusSection/StatusSection';
import { useInheritedStatusInfo } from '../../useInheritedStatus';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { useRightsSection } from '../utils/useRightsSection';
import { DelegationAction } from '../EditModal';
import {
  DelegationActionButtons,
  DelegationRightsPanel,
  useDelegationPanelState,
} from '../DelegationRightsPanel';
import { ResourceHeading } from './ResourceHeading';
import { RightsSection } from './RightsSection';
import { isExpiredResource } from '../../ResourceList/utils';
import { useSingleRightsDelegationRightsData } from './hooks/useSingleRightsDelegationRightsData';
import { useSingleRightRequests } from './hooks/useSingleRightRequests';

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
  const { t } = useTranslation();
  const { actingParty, fromParty, toParty } = usePartyRepresentation();

  const isSingleRightRequest = availableActions?.includes(DelegationAction.REQUEST);
  const hasDelegateAction = availableActions?.includes(DelegationAction.DELEGATE);

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

  const {
    toName,
    missingAccess,
    technicalErrorDetails,
    showMissingRightsStatus,
    cannotDelegateHere,
    cannotRequestRight,
    displayResourceAlert,
    screenReaderMessage,
  } = useDelegationPanelState({
    resource,
    rights,
    hasAccess,
    availableActions,
    toPartyName,
    isActionLoading,
    delegationError,
    delegationCheckedRights: delegationCheckedActions,
    delegationCheckError,
    errorDetails: rightsMetaTechnicalErrorDetails,
  });

  const inheritedStatus = useInheritedStatusInfo({
    permissions:
      resourceDelegations?.find((d) => d.resource.identifier === resource.identifier)
        ?.permissions || [],
    toParty,
    fromParty,
    actingParty,
  });

  const isPendingRequest = hasPendingRequest(resource.identifier);
  const isLoadingSingleRightRequest = isLoadingRequest(resource.identifier);

  const isExpired = isExpiredResource(resource);
  const isExpiredDescription = !isSingleRightRequest
    ? t('delegation_modal.expired_resource_description', { name: toName })
    : t('delegation_modal.expired_resource_request_description');

  return (
    <DelegationRightsPanel
      header={<ResourceHeading resource={resource} />}
      screenReaderMessage={screenReaderMessage}
      isActionLoading={isActionLoading}
      isActionSuccess={isActionSuccess}
      isLoading={isRightsSectionLoading || isResourceDelegationsLoading}
      isSecondaryActionLoading={isLoadingSingleRightRequest}
      body={
        <>
          <StatusSection
            userHasAccess={hasAccess}
            showDelegationCheckWarning={showMissingRightsStatus}
            inheritedStatus={inheritedStatus}
            cannotDelegateHere={cannotDelegateHere}
            cannotRequestRight={cannotRequestRight}
            isPendingRequest={isPendingRequest}
          />
          {resource.description && <DsParagraph>{resource.description}</DsParagraph>}
          {resource.rightDescription && <DsParagraph>{resource.rightDescription}</DsParagraph>}
          {isExpired && <DsParagraph>{isExpiredDescription}</DsParagraph>}
        </>
      }
      alert={
        displayResourceAlert
          ? {
              error: technicalErrorDetails,
              availableActions,
              rightReasons: rights.map((r) => r.delegationReason),
              resource,
            }
          : null
      }
      rights={
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
      }
      actions={
        <DelegationActionButtons
          showDelegate={!!hasDelegateAction}
          hasExistingAccess={hasAccess}
          isDelegateDisabled={
            isActionLoading ||
            displayResourceAlert ||
            !rights.some((r) => r.checked === true) ||
            !hasUnsavedChanges
          }
          onDelegate={delegateChosenRights}
          onUpdate={saveEditedRights}
          showRevoke={hasAccess && !!toParty}
          isRevokeDisabled={
            isActionLoading || rights.length === 0 || rights.some((r) => r.inherited === true)
          }
          onRevoke={revokeResource}
        >
          {!hasAccess && !isPendingRequest && isSingleRightRequest && (
            <DsButton
              data-size='sm'
              disabled={displayResourceAlert || isLoadingSingleRightRequest}
              loading={isLoadingSingleRightRequest}
              onClick={() => createRequest(resource)}
            >
              {t('common.request_poa')}
            </DsButton>
          )}
          {isPendingRequest && isSingleRightRequest && (
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
        </DelegationActionButtons>
      }
    />
  );
};

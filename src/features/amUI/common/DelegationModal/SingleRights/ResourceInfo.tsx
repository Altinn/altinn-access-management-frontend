import * as React from 'react';
import {
  Button,
  DsAlert,
  DsButton,
  DsHeading,
  DsParagraph,
  formatDisplayName,
  ListItem,
} from '@altinn/altinn-components';

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
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { PartyType } from '@/rtk/features/userInfoApi';
import { createErrorDetails } from '../../TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { ResourceAlert } from './ResourceAlert';
import { CheckmarkCircleIcon, MinusCircleIcon } from '@navikt/aksel-icons';
import { RightChips } from './RightChips';

export interface ResourceInfoProps {
  resource: ServiceResource;
  onDelegate?: () => void;
  availableActions?: DelegationAction[];
}

export const ResourceInfo = ({ resource, onDelegate, availableActions }: ResourceInfoProps) => {
  const isSmall = useIsMobileOrSmaller();
  const [rightsExpanded, setRightsExpanded] = useState(false);

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
    (availableActions?.includes(DelegationAction.DELEGATE) &&
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
              <>
                {delegationError && (
                  <DsAlert
                    data-color='danger'
                    data-size='sm'
                  >
                    <DsHeading
                      level={3}
                      data-size='xs'
                    >
                      {t('delegation_modal.technical_error_message.heading')}
                    </DsHeading>
                    <DsParagraph>
                      {delegationError !== 'revoke' &&
                        `${t('delegation_modal.technical_error_message.message')} ${t('delegation_modal.technical_error_message.all_failed', { name: toName })}`}
                      {delegationError === 'revoke' &&
                        t('delegation_modal.technical_error_message.revoke_failed')}
                    </DsParagraph>
                  </DsAlert>
                )}
                {missingAccess && availableActions?.includes(DelegationAction.DELEGATE) && (
                  <DsAlert
                    data-color='info'
                    data-size='sm'
                  >
                    {missingAccess}
                  </DsAlert>
                )}
                <div className={classes.rightsSection}>
                  <DsHeading
                    level={4}
                    data-size={isSmall ? '2xs' : 'xs'}
                  >
                    {hasAccess && !hasUnsavedChanges ? (
                      <Trans
                        i18nKey='delegation_modal.name_has_the_following'
                        values={{ name: toName }}
                        components={{ strong: <strong /> }}
                      />
                    ) : (
                      <Trans
                        i18nKey='delegation_modal.name_will_receive'
                        values={{ name: toName }}
                        components={{ strong: <strong /> }}
                      />
                    )}
                  </DsHeading>
                  <ListItem
                    loading={isDelegationCheckLoading}
                    icon={CheckmarkCircleIcon}
                    collapsible={true}
                    size={isSmall ? 'sm' : 'md'}
                    title={
                      rights.filter((r) => r.checked).length !== rights.length
                        ? t('delegation_modal.actions.partial_access', {
                            count: rights.filter((r) => r.checked).length,
                            total: rights.length,
                          })
                        : t('delegation_modal.actions.access_to_all')
                    }
                    onClick={() => setRightsExpanded(!rightsExpanded)}
                    expanded={rightsExpanded}
                    as='button'
                    border='solid'
                    shadow='none'
                  >
                    <div className={classes.rightExpandableContent}>
                      <DsParagraph>
                        {isSingleRightRequest
                          ? t('delegation_modal.actions.request_action_description')
                          : t('delegation_modal.actions.action_description')}
                      </DsParagraph>
                      <div className={classes.rightChips}>
                        <RightChips
                          rights={rights}
                          setRights={setRights}
                          editable={availableActions?.includes(DelegationAction.DELEGATE)}
                        />
                      </div>
                      {undelegableActions.length > 0 &&
                        availableActions?.includes(DelegationAction.DELEGATE) && (
                          <div className={classes.undelegableSection}>
                            <DsHeading
                              level={5}
                              data-size='2xs'
                              className={classes.undelegableHeader}
                            >
                              {t('delegation_modal.actions.cannot_give_header')}
                            </DsHeading>
                            <div className={classes.undelegableActions}>
                              {undelegableActions.join(', ')}
                            </div>
                          </div>
                        )}
                    </div>
                  </ListItem>
                </div>
              </>
            )}
            <div className={classes.editButtons}>
              {availableActions?.includes(DelegationAction.DELEGATE) && (
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
                  variant={
                    availableActions?.includes(DelegationAction.DELEGATE) ? 'tertiary' : 'primary'
                  }
                  className={classes.deleteButton}
                  onClick={revokeResource}
                  disabled={rights.length === 0 || rights.some((r) => r.inherited === true)}
                  color='danger'
                >
                  <MinusCircleIcon aria-hidden='true' />
                  {t('common.delete_poa')}
                </Button>
              )}
              {!hasAccess &&
                !hasPendingRequest(resource.identifier) &&
                availableActions?.includes(DelegationAction.REQUEST) && (
                  <DsButton
                    data-size='sm'
                    disabled={!resource.delegable || isLoadingSingleRightRequest}
                    loading={isLoadingSingleRightRequest}
                    onClick={() => createRequest(resource)}
                  >
                    {t('common.request_poa')}
                  </DsButton>
                )}
              {hasPendingRequest(resource.identifier) &&
                availableActions?.includes(DelegationAction.REQUEST) && (
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

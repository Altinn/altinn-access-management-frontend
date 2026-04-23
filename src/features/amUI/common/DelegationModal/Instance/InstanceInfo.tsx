import * as React from 'react';
import { Button, formatDisplayName } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { MinusCircleIcon } from '@navikt/aksel-icons';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { PartyType } from '@/rtk/features/userInfoApi';
import {
  type DialogLookup,
  useDelegateInstanceRightsMutation,
  useUpdateInstanceRightsMutation,
  useRemoveInstanceMutation,
} from '@/rtk/features/instanceApi';
import { StatusMessageForScreenReader } from '@/components/StatusMessageForScreenReader/StatusMessageForScreenReader';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import { createErrorDetails } from '../../TechnicalErrorParagraphs/TechnicalErrorParagraphs';

import { StatusSection } from '../../StatusSection/StatusSection';
import { LoadingAnimation } from '../../LoadingAnimation/LoadingAnimation';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { getMissingAccessMessage } from '../missingAccessUtils';
import { useRightsSection } from '../utils/useRightsSection';
import type { DelegationRecipient } from '../EditModal';
import { DelegationAction } from '../EditModal';
import { RightsSection } from '../SingleRights/RightsSection';
import { ResourceAlert } from '../SingleRights/ResourceAlert';
import { ResourceInfoSkeleton } from '../SingleRights/ResourceInfoSkeleton';
import { InstanceMetadataDescription } from '../../InstanceDescription/InstanceDescription';
import { useInstanceDelegationRightsData } from './useInstanceDelegationRightsData';

import classes from './InstanceInfo.module.css';

export interface InstanceInfoProps {
  resource: ServiceResource;
  instanceUrn: string;
  dialogLookup?: DialogLookup;
  toParty?: DelegationRecipient;
  availableActions?: DelegationAction[];
  onSuccess?: () => void;
}

export const InstanceInfo = ({
  resource,
  instanceUrn,
  dialogLookup,
  toParty: toPartyProp,
  availableActions,
  onSuccess,
}: InstanceInfoProps) => {
  const { t } = useTranslation();
  const isSmall = useIsMobileOrSmaller();
  const { toParty: toPartyContext, fromParty, actingParty } = usePartyRepresentation();
  const toParty = toPartyProp ?? toPartyContext;
  const toPartyUuid = toParty?.partyUuid ?? '';

  const hasDelegateAction = availableActions?.includes(DelegationAction.DELEGATE);
  const canRevoke = availableActions?.includes(DelegationAction.REVOKE) ?? false;

  const toName = formatDisplayName({
    fullName: toParty?.name ?? '',
    type: toParty?.partyTypeName === PartyType.Organization ? 'company' : 'person',
  });

  const {
    rights,
    setRights,
    hasAccess,
    hasDirectAccess,
    isLoading,
    delegationCheckedRights,
    delegationCheckError,
    errorDetails,
  } = useInstanceDelegationRightsData({
    resourceId: resource.identifier,
    instanceUrn,
    fromPartyUuid: fromParty?.partyUuid,
    toPartyUuid,
    mode: canRevoke ? 'edit' : 'delegate',
  });

  const [delegateInstance] = useDelegateInstanceRightsMutation();
  const [updateInstance] = useUpdateInstanceRightsMutation();
  const [removeInstance] = useRemoveInstanceMutation();

  const onDelegate = (
    actionKeys: string[],
    onSuccess: () => void,
    onError: (error: any) => void,
  ) => {
    if (!actingParty) return;
    delegateInstance({
      party: actingParty.partyUuid,
      to: toPartyUuid,
      resource: resource.identifier,
      instance: instanceUrn,
      input: { directRightKeys: actionKeys },
    })
      .unwrap()
      .then(onSuccess)
      .catch(onError);
  };

  const onUpdate = (actionKeys: string[], onSuccess: () => void, onError: (error: any) => void) => {
    if (!actingParty) return;
    updateInstance({
      party: actingParty.partyUuid,
      to: toPartyUuid,
      resource: resource.identifier,
      instance: instanceUrn,
      actionKeys,
    })
      .unwrap()
      .then(onSuccess)
      .catch(onError);
  };

  const onRevoke = (onSuccess: () => void, onError: (error: any) => void) => {
    if (!actingParty || !fromParty) return;
    removeInstance({
      party: actingParty.partyUuid,
      from: fromParty.partyUuid,
      to: toPartyUuid,
      resource: resource.identifier,
      instance: instanceUrn,
    })
      .unwrap()
      .then(onSuccess)
      .catch(onError);
  };

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
    onDelegate: onSuccess,
    actions: {
      delegate: onDelegate,
      update: onUpdate,
      revoke: onRevoke,
    },
  });

  const rawMissingAccess = delegationCheckedRights
    ? getMissingAccessMessage(
        delegationCheckedRights,
        t,
        resource?.resourceOwnerName,
        actingParty?.name,
      )
    : null;

  const missingAccess = isActionLoading || delegationError ? null : rawMissingAccess;

  const delegationCheckErrorDetails = !!delegationCheckError
    ? createErrorDetails(delegationCheckError)
    : null;
  const technicalErrorDetails = errorDetails ?? (hasAccess ? null : delegationCheckErrorDetails);

  const hasDelegableRights = rights.some((r) => r.delegable);
  const showMissingRightsStatus = !hasAccess && rights.length > 0 && !hasDelegableRights;
  const cannotDelegateHere = resource?.delegable === false;

  const displayResourceAlert =
    !!technicalErrorDetails ||
    (hasDelegateAction &&
      !hasAccess &&
      (!!delegationCheckError ||
        resource?.delegable === false ||
        (rights.length > 0 && !rights.some((r) => r.delegable === true))));

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
        <InstanceMetadataDescription
          resource={resource}
          instanceData={{
            instance: {
              refId: instanceUrn,
              type: null,
            },
            dialogLookup,
          }}
          fromPartyName={fromParty?.name}
          fromPartyType={fromParty?.partyTypeName}
          statusSection={
            <div
              className={classes.resourceInfo}
              data-size={isSmall ? 'xs' : 'md'}
            >
              <StatusSection
                userHasAccess={hasAccess}
                showDelegationCheckWarning={showMissingRightsStatus}
                cannotDelegateHere={cannotDelegateHere}
                toPartyName={toName}
              />
            </div>
          }
        />

        {isActionLoading || isActionSuccess ? (
          <LoadingAnimation
            isLoading={isActionLoading}
            displaySuccess={isActionSuccess}
          />
        ) : isLoading ? (
          <ResourceInfoSkeleton />
        ) : (
          <>
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
                isDelegationCheckLoading={isLoading}
                toName={toName}
                availableActions={availableActions}
                delegationError={delegationError}
                missingAccess={missingAccess && hasDelegateAction ? missingAccess : null}
                hasAccessAndNoChanges={hasDirectAccess && !hasUnsavedChanges}
                allAccessTitle={t('delegation_modal.instance_actions.access_to_all')}
                actionDescription={t('delegation_modal.instance_actions.action_description')}
              />
            )}
            <div className={classes.editButtons}>
              {hasDelegateAction && (
                <Button
                  data-size='sm'
                  disabled={
                    isActionLoading ||
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
                  data-size='sm'
                  variant={hasDelegateAction ? 'tertiary' : 'primary'}
                  onClick={revokeResource}
                  disabled={
                    isActionLoading ||
                    !rights.some((r) => r.delegated === true && r.inherited !== true)
                  }
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

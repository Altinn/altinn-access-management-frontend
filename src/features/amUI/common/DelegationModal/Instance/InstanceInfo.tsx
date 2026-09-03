import { useTranslation } from 'react-i18next';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import {
  type DialogLookup,
  useDelegateInstanceRightsMutation,
  useUpdateInstanceRightsMutation,
  useRemoveInstanceMutation,
} from '@/rtk/features/instanceApi';

import { StatusSection } from '../../StatusSection/StatusSection';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { useRightsSection } from '../utils/useRightsSection';
import type { DelegationRecipient } from '../EditModal';
import { DelegationAction } from '../EditModal';
import {
  DelegationActionButtons,
  DelegationPanelSection,
  DelegationRightsPanel,
  useDelegationPanelState,
} from '../DelegationRightsPanel';
import { RightsSection } from '../SingleRights/RightsSection';
import { InstanceDescription } from '../../InstanceDescription/InstanceDescription';
import { useInstanceDelegationRightsData } from './useInstanceDelegationRightsData';

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
  const { toParty: toPartyContext, fromParty, actingParty } = usePartyRepresentation();
  const toParty = toPartyProp ?? toPartyContext;
  const toPartyUuid = toParty?.partyUuid ?? '';

  const hasDelegateAction = availableActions?.includes(DelegationAction.DELEGATE);
  const canRevoke = availableActions?.includes(DelegationAction.REVOKE) ?? false;

  const {
    rights,
    setRights,
    hasAccess,
    hasDirectAccess,
    isLoading,
    isDelegationCheckLoading,
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
    onDelegateSuccess: () => void,
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
      .then(onDelegateSuccess)
      .catch(onError);
  };

  const onUpdate = (
    actionKeys: string[],
    onUpdateSuccess: () => void,
    onError: (error: any) => void,
  ) => {
    if (!actingParty) return;
    updateInstance({
      party: actingParty.partyUuid,
      to: toPartyUuid,
      resource: resource.identifier,
      instance: instanceUrn,
      actionKeys,
    })
      .unwrap()
      .then(onUpdateSuccess)
      .catch(onError);
  };

  const onRevoke = (onRevokeSuccess: () => void, onError: (error: any) => void) => {
    if (!actingParty || !fromParty) return;
    removeInstance({
      party: actingParty.partyUuid,
      from: fromParty.partyUuid,
      to: toPartyUuid,
      resource: resource.identifier,
      instance: instanceUrn,
    })
      .unwrap()
      .then(onRevokeSuccess)
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

  const {
    toName,
    missingAccess,
    technicalErrorDetails,
    showMissingRightsStatus,
    cannotDelegateHere,
    displayResourceAlert,
    screenReaderMessage,
  } = useDelegationPanelState({
    resource,
    rights,
    hasAccess,
    availableActions,
    toParty,
    isActionLoading,
    delegationError,
    delegationCheckedRights,
    delegationCheckError,
    errorDetails,
  });

  return (
    <DelegationRightsPanel
      header={
        <InstanceDescription
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
          titleLevel={2}
          statusSection={
            <DelegationPanelSection>
              <StatusSection
                userHasAccess={hasAccess}
                showDelegationCheckWarning={showMissingRightsStatus}
                cannotDelegateHere={cannotDelegateHere}
                toPartyName={toName}
              />
            </DelegationPanelSection>
          }
        />
      }
      screenReaderMessage={screenReaderMessage}
      isActionLoading={isActionLoading}
      isActionSuccess={isActionSuccess}
      isLoading={isLoading}
      alert={
        displayResourceAlert
          ? {
              error: technicalErrorDetails,
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
          hasAccessAndNoChanges={hasDirectAccess && !hasUnsavedChanges}
          allAccessTitle={t('delegation_modal.instance_actions.access_to_all')}
          actionDescription={t('delegation_modal.instance_actions.action_description')}
        />
      }
      actions={
        <DelegationActionButtons
          showDelegate={!!hasDelegateAction}
          hasExistingAccess={hasDirectAccess}
          isDelegateDisabled={
            isActionLoading ||
            displayResourceAlert ||
            !rights.some((r) => r.checked === true) ||
            !hasUnsavedChanges
          }
          onDelegate={delegateChosenRights}
          onUpdate={saveEditedRights}
          showRevoke={canRevoke && hasDirectAccess && !!toParty}
          isRevokeDisabled={
            isActionLoading || !rights.some((r) => r.delegated === true && r.inherited !== true)
          }
          onRevoke={revokeResource}
        />
      }
    />
  );
};

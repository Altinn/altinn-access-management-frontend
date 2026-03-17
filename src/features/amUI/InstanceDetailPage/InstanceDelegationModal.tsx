import { forwardRef, useEffect, useMemo, useState } from 'react';
import { DsDialog, DsParagraph } from '@altinn/altinn-components';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import { useTranslation } from 'react-i18next';

import { StatusMessageForScreenReader } from '@/components/StatusMessageForScreenReader/StatusMessageForScreenReader';
import { ErrorCode } from '@/resources/utils/errorCodeUtils';
import {
  useDelegateInstanceRightsMutation,
  useInstanceDelegationCheckQuery,
} from '@/rtk/features/instanceApi';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import type {
  DelegationCheckedRight,
  ServiceResource,
} from '@/rtk/features/singleRights/singleRightsApi';

import { LoadingAnimation } from '../common/LoadingAnimation/LoadingAnimation';
import {
  PartyRepresentationProvider,
  usePartyRepresentation,
} from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { StatusSection } from '../common/StatusSection/StatusSection';
import { DelegationAction } from '../common/DelegationModal/EditModal';
import { ResourceHeading } from '../common/DelegationModal/SingleRights/ResourceHeading';
import { ResourceInfoSkeleton } from '../common/DelegationModal/SingleRights/ResourceInfoSkeleton';
import { RightsSection } from '../common/DelegationModal/SingleRights/RightsSection';
import {
  mapRightsToChipRights,
  type ChipRight,
} from '../common/DelegationModal/SingleRights/hooks/rightsUtils';
import { useRightChips } from '../common/DelegationModal/SingleRights/hooks/useRightChips';

import dialogClasses from '../common/DelegationModal/DelegationModal.module.css';
import classes from '../common/DelegationModal/SingleRights/ResourceInfo.module.css';

interface InstanceDelegationModalProps {
  resource?: ServiceResource;
  instanceUrn: string;
  actingPartyUuid?: string;
  fromPartyUuid?: string;
  toPartyUuid?: string;
  onClose?: () => void;
}

export const InstanceDelegationModal = forwardRef<HTMLDialogElement, InstanceDelegationModalProps>(
  ({ resource, instanceUrn, actingPartyUuid, fromPartyUuid, toPartyUuid, onClose }, ref) => {
    useEffect(() => {
      const handleClose = () => onClose?.();

      if (ref && 'current' in ref && ref.current) {
        ref.current.addEventListener('close', handleClose);
      }

      return () => {
        if (ref && 'current' in ref && ref.current) {
          ref.current.removeEventListener('close', handleClose);
        }
      };
    }, [onClose, ref]);

    return (
      <DsDialog
        ref={ref}
        className={dialogClasses.modalDialog}
        closedby='any'
        onClose={onClose}
      >
        {resource && actingPartyUuid && fromPartyUuid && toPartyUuid ? (
          <PartyRepresentationProvider
            actingPartyUuid={actingPartyUuid}
            fromPartyUuid={fromPartyUuid}
            toPartyUuid={toPartyUuid}
            loadingComponent={<ResourceInfoSkeleton />}
          >
            <InstanceDelegationModalContent
              resource={resource}
              instanceUrn={instanceUrn}
              onComplete={() => {
                if (ref && 'current' in ref && ref.current?.open) {
                  ref.current.close();
                }
              }}
            />
          </PartyRepresentationProvider>
        ) : null}
      </DsDialog>
    );
  },
);

const getMissingAccessMessage = (
  response: DelegationCheckedRight[],
  t: ReturnType<typeof useTranslation>['t'],
  resourceOwnerName?: string,
  reporteeName?: string,
) => {
  const hasMissingRoleAccess = response.some((right) =>
    right.reasonCodes.some(
      (reasonCode) =>
        reasonCode === ErrorCode.MissingRoleAccess ||
        reasonCode === ErrorCode.MissingRightAccess ||
        reasonCode === ErrorCode.MissingDelegationAccess ||
        reasonCode === ErrorCode.MissingPackageAccess,
    ),
  );
  const hasMissingSrrRightAccess = response.some(
    (right) =>
      !hasMissingRoleAccess &&
      right.reasonCodes.some(
        (reasonCode) =>
          reasonCode === ErrorCode.MissingSrrRightAccess ||
          reasonCode === ErrorCode.AccessListValidationFail,
      ),
  );

  if (hasMissingRoleAccess) {
    return t('delegation_modal.specific_rights.missing_role_message');
  }
  if (hasMissingSrrRightAccess) {
    return t('delegation_modal.specific_rights.missing_srr_right_message', {
      resourceOwner: resourceOwnerName,
      reportee: reporteeName,
    });
  }

  return null;
};

const InstanceDelegationModalContent = ({
  resource,
  instanceUrn,
  onComplete,
}: {
  resource: ServiceResource;
  instanceUrn: string;
  onComplete: () => void;
}) => {
  const { t } = useTranslation();
  const { actingParty, fromParty, toParty } = usePartyRepresentation();
  const { data: reportee } = useGetReporteeQuery();
  const [rights, setRights] = useState<ChipRight[]>([]);
  const [delegationError, setDelegationError] = useState<'delegate' | null>(null);
  const [missingAccess, setMissingAccess] = useState<string | null>(null);
  const [isActionSuccess, setIsActionSuccess] = useState(false);
  const [delegateInstanceRights, { isLoading: isActionLoading }] =
    useDelegateInstanceRightsMutation();

  const {
    data: delegationCheckedActions,
    isError: isDelegationCheckError,
    error: delegationCheckError,
    isLoading: isDelegationCheckLoading,
  } = useInstanceDelegationCheckQuery(
    {
      party: fromParty?.partyUuid || '',
      resource: resource.identifier,
      instance: instanceUrn,
    },
    {
      skip: !fromParty?.partyUuid || !resource.identifier || !instanceUrn,
    },
  );

  const rightsMeta = useMemo(
    () => delegationCheckedActions?.map((right) => right.right) ?? [],
    [delegationCheckedActions],
  );

  const rightsMetaTechnicalErrorDetails =
    !isDelegationCheckLoading && !isDelegationCheckError && rightsMeta.length === 0
      ? {
          status: 'empty response',
          time: new Date().toISOString(),
        }
      : null;

  useEffect(() => {
    if (!delegationCheckedActions) {
      return;
    }

    setMissingAccess(
      getMissingAccessMessage(
        delegationCheckedActions,
        t,
        resource.resourceOwnerName,
        reportee?.name,
      ),
    );
    setRights(
      mapRightsToChipRights(rightsMeta, delegationCheckedActions, {
        isChecked: (right) => right.result === true,
      }),
    );
  }, [delegationCheckedActions, reportee?.name, resource.resourceOwnerName, rightsMeta, t]);

  const hasUnsavedChanges = rights.some((right) => right.checked !== right.delegated);
  const undelegableActions = rights
    .filter((right) => !right.delegable)
    .map((right) => right.rightName);
  const hasDelegableRights = rights.some((right) => right.delegable);

  const delegateChosenRights = async () => {
    const actionKeys = rights.filter((right) => right.checked).map((right) => right.rightKey);

    if (!actingParty?.partyUuid || !toParty?.partyUuid || actionKeys.length === 0) {
      return;
    }

    setDelegationError(null);
    setMissingAccess(null);

    try {
      await delegateInstanceRights({
        party: actingParty.partyUuid,
        to: toParty.partyUuid,
        resource: resource.identifier,
        instance: instanceUrn,
        actionKeys,
      }).unwrap();

      setIsActionSuccess(true);
    } catch {
      setDelegationError('delegate');
    }
  };

  const { chips } = useRightChips(rights, setRights, classes.chip);

  return (
    <>
      <StatusMessageForScreenReader politenessSetting='assertive'>
        {delegationError ?? missingAccess ?? ''}
      </StatusMessageForScreenReader>
      {isActionLoading || isActionSuccess ? (
        <LoadingAnimation
          isLoading={isActionLoading}
          displaySuccess={isActionSuccess}
          onAnimationEnd={isActionSuccess ? onComplete : undefined}
        />
      ) : isDelegationCheckLoading ? (
        <ResourceInfoSkeleton />
      ) : (
        <div>
          <ResourceHeading resource={resource} />
          <div
            className={classes.resourceInfo}
            data-size='md'
          >
            <StatusSection
              showDelegationCheckWarning={!hasDelegableRights && rights.length > 0}
              cannotDelegateHere={resource.delegable === false}
            />
            {resource.description && <DsParagraph>{resource.description}</DsParagraph>}
          </div>
          <RightsSection
            resource={resource}
            chips={chips}
            saveEditedRights={() => undefined}
            delegateChosenRights={() => {
              void delegateChosenRights();
            }}
            revokeResource={() => undefined}
            availableActions={[DelegationAction.DELEGATE]}
            undelegableActions={undelegableActions}
            rights={rights}
            hasUnsavedChanges={hasUnsavedChanges}
            hasAccess={false}
            isDelegationCheckLoading={isDelegationCheckLoading}
            isDelegationCheckError={isDelegationCheckError}
            delegationCheckError={
              delegationCheckError as FetchBaseQueryError | SerializedError | undefined
            }
            delegationError={delegationError}
            missingAccess={missingAccess}
            rightsMetaTechnicalErrorDetails={rightsMetaTechnicalErrorDetails}
          />
        </div>
      )}
    </>
  );
};

InstanceDelegationModal.displayName = 'InstanceDelegationModal';

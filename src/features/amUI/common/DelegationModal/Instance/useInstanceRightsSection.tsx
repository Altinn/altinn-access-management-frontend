import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  type DelegationCheckedRight,
  type ServiceResource,
} from '@/rtk/features/singleRights/singleRightsApi';
import {
  useDelegateInstanceRightsMutation,
  useUpdateInstanceRightsMutation,
  useRemoveInstanceMutation,
} from '@/rtk/features/instanceApi';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { ErrorCode } from '@/resources/utils/errorCodeUtils';
import { createErrorDetails } from '@/features/amUI/common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { useInstanceDelegationRightsData } from './useInstanceDelegationRightsData';

export const useInstanceRightsSection = ({
  resource,
  instanceUrn,
  toPartyUuid: toPartyUuidProp,
  onSuccess,
  mode = 'edit',
}: {
  resource: ServiceResource;
  instanceUrn: string;
  toPartyUuid?: string;
  onSuccess?: () => void;
  mode?: 'edit' | 'delegate';
}) => {
  const { t } = useTranslation();
  const { toParty, fromParty, actingParty } = usePartyRepresentation();
  const toPartyUuid = toPartyUuidProp ?? toParty?.partyUuid ?? '';

  const [delegationError, setDelegationError] = useState<'delegate' | 'revoke' | 'edit' | null>(
    null,
  );
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isActionSuccess, setIsActionSuccess] = useState(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const { data: reportee } = useGetReporteeQuery();
  const [delegateInstance] = useDelegateInstanceRightsMutation();
  const [updateInstance] = useUpdateInstanceRightsMutation();
  const [removeInstance] = useRemoveInstanceMutation();

  const {
    rights,
    setRights,
    hasAccess,
    hasDirectAccess,
    isLoading,
    isDelegationCheckLoading,
    isDelegationCheckError,
    delegationCheckError,
    delegationCheckedRights,
    rightsMetaTechnicalErrorDetails,
    instanceRightsErrorDetails,
  } = useInstanceDelegationRightsData({
    resourceId: resource.identifier,
    instanceUrn,
    fromPartyUuid: fromParty?.partyUuid,
    toPartyUuid,
    mode,
  });

  useEffect(() => {
    setDelegationError(null);
  }, [toPartyUuid]);

  const hasUnsavedChanges = rights.some((r) => r.checked !== r.delegated);
  const undelegableActions = rights.filter((r) => !r.delegable).map((r) => r.rightName);

  const getMissingAccessMessage = useCallback(
    (response: DelegationCheckedRight[]) => {
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
          resourceOwner: resource?.resourceOwnerName,
          reportee: reportee?.name,
        });
      }
      return null;
    },
    [t, resource?.resourceOwnerName, reportee?.name],
  );

  const defaultMissingAccess = useMemo(() => {
    if (!delegationCheckedRights) {
      return null;
    }

    return getMissingAccessMessage(delegationCheckedRights);
  }, [delegationCheckedRights, getMissingAccessMessage]);

  const missingAccess = isActionLoading || delegationError ? null : defaultMissingAccess;

  const delegationCheckErrorDetails = isDelegationCheckError
    ? createErrorDetails(delegationCheckError)
    : null;
  const technicalErrorDetails =
    rightsMetaTechnicalErrorDetails ??
    instanceRightsErrorDetails ??
    (hasAccess ? null : delegationCheckErrorDetails);

  const handleSuccess = () => {
    setIsActionLoading(false);
    setIsActionSuccess(true);
    successTimerRef.current = setTimeout(() => setIsActionSuccess(false), 2000);
    onSuccess?.();
  };

  const applyActionStates = () => {
    setIsActionLoading(true);
    setIsActionSuccess(false);
    setDelegationError(null);
  };

  const saveEditedRights = () => {
    const actionKeys = rights.filter((r) => r.checked).map((r) => r.rightKey);
    if (actingParty && toPartyUuid) {
      applyActionStates();
      updateInstance({
        party: actingParty.partyUuid,
        to: toPartyUuid,
        resource: resource.identifier,
        instance: instanceUrn,
        actionKeys,
      })
        .unwrap()
        .then(handleSuccess)
        .catch(() => {
          setIsActionLoading(false);
          setDelegationError('edit');
        });
    }
  };

  const delegateChosenRights = () => {
    const actionKeys = rights.filter((r) => r.checked).map((r) => r.rightKey);
    if (actingParty && toPartyUuid) {
      applyActionStates();
      delegateInstance({
        party: actingParty.partyUuid,
        to: toPartyUuid,
        resource: resource.identifier,
        instance: instanceUrn,
        input: { directRightKeys: actionKeys },
      })
        .unwrap()
        .then(handleSuccess)
        .catch(() => {
          setIsActionLoading(false);
          setDelegationError('delegate');
        });
    }
  };

  const revokeResource = () => {
    if (actingParty && fromParty && toPartyUuid) {
      applyActionStates();
      removeInstance({
        party: actingParty.partyUuid,
        from: fromParty.partyUuid,
        to: toPartyUuid,
        resource: resource.identifier,
        instance: instanceUrn,
      })
        .unwrap()
        .then(handleSuccess)
        .catch(() => {
          setIsActionLoading(false);
          setDelegationError('revoke');
        });
    }
  };

  return {
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
    isActionLoading,
    isActionSuccess,
    isLoading,
    technicalErrorDetails,
  };
};

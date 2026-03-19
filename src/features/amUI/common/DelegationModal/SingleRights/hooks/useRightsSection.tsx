import { useDelegateRights } from '@/resources/hooks/useDelegateRights';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChipRight, mapRightsToChipRights } from './rightsUtils';
import {
  DelegationCheckedRight,
  ServiceResource,
  useDelegationCheckQuery,
  useGetResourceRightsMetaQuery,
  useGetResourceRightsQuery,
} from '@/rtk/features/singleRights/singleRightsApi';
import { PartyType, useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { usePartyRepresentation } from '../../../PartyRepresentationContext/PartyRepresentationContext';
import { ErrorCode } from '@/resources/utils/errorCodeUtils';
import { createErrorDetails } from '@/features/amUI/common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';

import { useUpdateResource } from '@/resources/hooks/useUpdateResource';
import { useRevokeResource } from '@/resources/hooks/useRevokeResource';
import { useHasResourceCheck } from './useHasResourceCheck';
import { useSingleRightRequests } from './useSingleRightRequests';

export const useRightsSection = ({
  resource,
  isRequest,
  onDelegate,
}: {
  resource: ServiceResource;
  isRequest?: boolean;
  onDelegate?: () => void;
}) => {
  const { t } = useTranslation();
  const delegateRights = useDelegateRights();
  const updateResource = useUpdateResource();

  /// State variables

  const [rights, setRights] = useState<ChipRight[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [delegationError, setDelegationError] = useState<'delegate' | 'revoke' | 'edit' | null>(
    null,
  );
  const [missingAccess, setMissingAccess] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isActionSuccess, setIsActionSuccess] = useState(false);

  /// Hooks and data fetching

  const { toParty, fromParty, actingParty } = usePartyRepresentation();
  const revoke = useRevokeResource();
  const { hasResourceAccess, isLoading: isResourceAccessLoading } = useHasResourceCheck(
    resource.identifier,
  );
  const {
    data: resourceRights,
    isFetching: isResourceRightsFetching,
    isLoading: isResourceRightsLoading,
  } = useGetResourceRightsQuery(
    {
      actingParty: actingParty?.partyUuid || '',
      from: fromParty?.partyUuid || '',
      to: toParty?.partyUuid || '',
      resourceId: resource.identifier,
    },
    { skip: !toParty || !fromParty || !actingParty || !resource.identifier || !hasResourceAccess }, // Only fetch resource rights if the rightholder has access to the resource
  );
  const { data: reportee } = useGetReporteeQuery();
  const {
    data: rightsMeta,
    isLoading: isRightsMetaLoading,
    isError: isRightsMetaError,
    error: rightsMetaError,
  } = useGetResourceRightsMetaQuery(
    {
      resourceId: resource.identifier,
    },
    { skip: !resource.identifier },
  );
  const { createRequest, deleteRequest, hasPendingRequest, isLoadingRequest } =
    useSingleRightRequests({
      canRequestRights: isRequest,
    });

  const {
    data: delegationCheckedActions,
    isError: isDelegationCheckError,
    error: delegationCheckError,
    isLoading: isDelegationCheckLoading,
  } = useDelegationCheckQuery(resource.identifier, { skip: !resource.identifier || isRequest });

  const isLoading =
    isResourceAccessLoading ||
    isRightsMetaLoading ||
    isDelegationCheckLoading ||
    (hasResourceAccess && isResourceRightsLoading);

  const isRightsMetaEmpty =
    !isRightsMetaLoading &&
    !isRightsMetaError &&
    Array.isArray(rightsMeta) &&
    rightsMeta.length === 0;

  const rightsMetaErrorDetails = createErrorDetails(rightsMetaError);
  const rightsMetaTechnicalErrorDetails =
    isRightsMetaError || isRightsMetaEmpty
      ? {
          status:
            rightsMetaErrorDetails?.status ?? (isRightsMetaEmpty ? 'empty response' : 'no status'),
          time: rightsMetaErrorDetails?.time ?? new Date().toISOString(),
        }
      : null;

  /// Computed values

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

  /// UseEffect hooks

  // Instantiate/reset access and rights states
  useEffect(() => {
    if (!isResourceRightsFetching) {
      if (
        hasResourceAccess &&
        resourceRights &&
        (resourceRights.directRights.length > 0 || resourceRights.indirectRights.length > 0)
      ) {
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
    }
  }, [resourceRights, isResourceRightsFetching, resource.identifier, hasResourceAccess]);

  // Instantiate/reset rights and missing access message states
  useEffect(() => {
    if (!rightsMeta || rightsMeta.length === 0) {
      return;
    }

    if (!delegationCheckedActions && !isDelegationCheckError && !isRequest) {
      return;
    }

    if (delegationCheckedActions) {
      setMissingAccess(getMissingAccessMessage(delegationCheckedActions));
    }

    if (hasAccess && resourceRights) {
      const chipRights: ChipRight[] = mapRightsToChipRights(rightsMeta, delegationCheckedActions, {
        isDelegated: (right) =>
          resourceRights.directRights.some((r) => r.right.key === right.right.key) ||
          resourceRights.indirectRights.some((r) => r.right.key === right.right.key),
        isInherited: (rightKey) =>
          resourceRights.indirectRights.some((r) => r.right.key === rightKey),
      });
      setRights(chipRights);
    } else {
      const chipRights: ChipRight[] = mapRightsToChipRights(rightsMeta, delegationCheckedActions, {
        isChecked: (right) => right.result === true || isRequest === true,
      });
      setRights(chipRights);
    }
  }, [
    rightsMeta,
    delegationCheckedActions,
    isDelegationCheckError,
    resource.identifier,
    hasAccess,
    resourceRights,
    isRequest,
    getMissingAccessMessage,
  ]);

  /// Functions

  const onSuccess = () => {
    setIsActionLoading(false);
    setIsActionSuccess(true);
    setTimeout(() => setIsActionSuccess(false), 2000);
    onDelegate?.();
  };

  const applyActionStates = () => {
    setIsActionLoading(true);
    setIsActionSuccess(false);
    setDelegationError(null);
    setMissingAccess(null);
  };

  const saveEditedRights = () => {
    const actionKeysToDelegate = rights
      .filter((right: ChipRight) => right.checked)
      .map((r) => r.rightKey);
    if (fromParty && toParty) {
      applyActionStates();
      updateResource(resource.identifier, actionKeysToDelegate, onSuccess, () => {
        setIsActionLoading(false);
        setDelegationError('edit');
      });
    }
  };

  const delegateChosenRights = () => {
    const actionKeysToDelegate = rights
      .filter((right: ChipRight) => right.checked)
      .map((r) => r.rightKey);

    if (fromParty && toParty) {
      applyActionStates();
      delegateRights(actionKeysToDelegate, resource.identifier, onSuccess, () => {
        setIsActionLoading(false);
        setDelegationError('delegate');
      });
    }
  };

  const revokeResource = () => {
    if (fromParty && toParty) {
      applyActionStates();
      revoke(resource.identifier, onSuccess, () => {
        setIsActionLoading(false);
        setDelegationError('revoke');
      });
    }
  };

  const sendRequest = () => {
    createRequest(resource);
  };

  const deleteSentRequest = () => {
    deleteRequest(resource);
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
    isDelegationCheckLoading,
    isDelegationCheckError,
    delegationCheckError,
    delegationError,
    missingAccess,
    isActionLoading,
    isActionSuccess,
    isLoading,
    rightsMetaTechnicalErrorDetails,
    isPendingRequest: hasPendingRequest(resource.identifier),
    isLoadingRequest: isLoadingRequest(resource.identifier),
    sendRequest,
    deleteSentRequest,
  };
};

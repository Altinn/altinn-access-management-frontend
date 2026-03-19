import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  type DelegationCheckedRight,
  type ServiceResource,
  useGetResourceRightsMetaQuery,
} from '@/rtk/features/singleRights/singleRightsApi';
import {
  useGetInstanceRightsQuery,
  useInstanceDelegationCheckQuery,
  useDelegateInstanceRightsMutation,
  useUpdateInstanceRightsMutation,
} from '@/rtk/features/instanceApi';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { ErrorCode } from '@/resources/utils/errorCodeUtils';
import { createErrorDetails } from '@/features/amUI/common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { mapRightsToChipRights, type ChipRight } from '../SingleRights/hooks/rightsUtils';
import { useRightChips } from '../SingleRights/hooks/useRightChips';

import classes from '../SingleRights/ResourceInfo.module.css';

export const useInstanceRightsSection = ({
  resource,
  instanceUrn,
  toPartyUuid: toPartyUuidProp,
  onDelegate,
}: {
  resource: ServiceResource;
  instanceUrn: string;
  toPartyUuid?: string;
  onDelegate?: () => void;
}) => {
  const { t } = useTranslation();
  const { toParty, fromParty, actingParty } = usePartyRepresentation();
  const toPartyUuid = toPartyUuidProp ?? toParty?.partyUuid ?? '';

  const [rights, setRights] = useState<ChipRight[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [delegationError, setDelegationError] = useState<'delegate' | 'revoke' | 'edit' | null>(
    null,
  );
  const [missingAccess, setMissingAccess] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isActionSuccess, setIsActionSuccess] = useState(false);

  const { data: reportee } = useGetReporteeQuery();
  const [delegateInstance] = useDelegateInstanceRightsMutation();
  const [updateInstance] = useUpdateInstanceRightsMutation();

  const {
    data: instanceRights,
    isFetching: isInstanceRightsFetching,
    isLoading: isInstanceRightsLoading,
  } = useGetInstanceRightsQuery(
    {
      party: actingParty?.partyUuid || '',
      from: fromParty?.partyUuid || '',
      to: toPartyUuid,
      resource: resource.identifier,
      instance: instanceUrn,
    },
    {
      skip: !actingParty || !fromParty || !toPartyUuid || !resource.identifier || !instanceUrn,
    },
  );

  const {
    data: rightsMeta,
    isLoading: isRightsMetaLoading,
    isError: isRightsMetaError,
    error: rightsMetaError,
  } = useGetResourceRightsMetaQuery(
    { resourceId: resource.identifier },
    { skip: !resource.identifier },
  );

  const {
    data: delegationCheckedActions,
    isError: isDelegationCheckError,
    error: delegationCheckError,
    isLoading: isDelegationCheckLoading,
  } = useInstanceDelegationCheckQuery(
    {
      party: actingParty?.partyUuid || '',
      resource: resource.identifier,
      instance: instanceUrn,
    },
    { skip: !actingParty || !resource.identifier || !instanceUrn },
  );

  const isLoading = isRightsMetaLoading || isDelegationCheckLoading || isInstanceRightsLoading;

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

  useEffect(() => {
    if (!isInstanceRightsFetching) {
      if (
        instanceRights &&
        (instanceRights.directRights.length > 0 || instanceRights.indirectRights.length > 0)
      ) {
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
    }
  }, [instanceRights, isInstanceRightsFetching]);

  useEffect(() => {
    if (!rightsMeta || rightsMeta.length === 0) return;
    if (!delegationCheckedActions && !isDelegationCheckError) return;

    if (delegationCheckedActions) {
      setMissingAccess(getMissingAccessMessage(delegationCheckedActions));
    }

    if (hasAccess && instanceRights) {
      const chipRights = mapRightsToChipRights(rightsMeta, delegationCheckedActions, {
        isDelegated: (right) =>
          instanceRights.directRights.some((r) => r.right.key === right.right.key) ||
          instanceRights.indirectRights.some((r) => r.right.key === right.right.key),
        isInherited: (rightKey) =>
          instanceRights.indirectRights.some((r) => r.right.key === rightKey),
      });
      setRights(chipRights);
    } else {
      const chipRights = mapRightsToChipRights(rightsMeta, delegationCheckedActions, {
        isChecked: (right) => right.result === true,
      });
      setRights(chipRights);
    }
  }, [
    rightsMeta,
    delegationCheckedActions,
    isDelegationCheckError,
    hasAccess,
    instanceRights,
    getMissingAccessMessage,
  ]);

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
    const actionKeys = rights.filter((r) => r.checked).map((r) => r.rightKey);
    if (actingParty && fromParty && toPartyUuid) {
      applyActionStates();
      updateInstance({
        party: actingParty.partyUuid,
        to: toPartyUuid,
        resource: resource.identifier,
        instance: instanceUrn,
        actionKeys,
      })
        .unwrap()
        .then(onSuccess)
        .catch(() => {
          setIsActionLoading(false);
          setDelegationError('edit');
        });
    }
  };

  const delegateChosenRights = () => {
    const actionKeys = rights.filter((r) => r.checked).map((r) => r.rightKey);
    if (actingParty && fromParty && toPartyUuid) {
      applyActionStates();
      delegateInstance({
        party: actingParty.partyUuid,
        to: toPartyUuid,
        resource: resource.identifier,
        instance: instanceUrn,
        actionKeys,
      })
        .unwrap()
        .then(onSuccess)
        .catch(() => {
          setIsActionLoading(false);
          setDelegationError('delegate');
        });
    }
  };

  const revokeResource = () => {
    if (actingParty && fromParty && toPartyUuid) {
      applyActionStates();
      updateInstance({
        party: actingParty.partyUuid,
        to: toPartyUuid,
        resource: resource.identifier,
        instance: instanceUrn,
        actionKeys: [],
      })
        .unwrap()
        .then(onSuccess)
        .catch(() => {
          setIsActionLoading(false);
          setDelegationError('revoke');
        });
    }
  };

  const { chips } = useRightChips(rights, setRights, classes.chip);

  return {
    chips,
    saveEditedRights,
    delegateChosenRights,
    revokeResource,
    undelegableActions,
    rights,
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
  };
};

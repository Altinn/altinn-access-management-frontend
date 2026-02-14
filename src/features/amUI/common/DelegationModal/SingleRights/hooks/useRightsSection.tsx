import { RightStatus } from '@/dataObjects/dtos/resourceDelegation';
import { useDelegateRights } from '@/resources/hooks/useDelegateRights';
import { formatDisplayName } from '@altinn/altinn-components';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChipRight, mapRightsToChipRights } from './rightsUtils';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import {
  DelegationCheckedAction,
  ServiceResource,
  useDelegationCheckQuery,
  useGetResourceRightsQuery,
  useGetSingleRightsForRightholderQuery,
} from '@/rtk/features/singleRights/singleRightsApi';
import { arraysEqualUnordered } from '@/resources/utils';
import { PartyType, useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { usePartyRepresentation } from '../../../PartyRepresentationContext/PartyRepresentationContext';
import { ErrorCode } from '@/resources/utils/errorCodeUtils';

import classes from '../ResourceInfo.module.css';
import { useRightChips } from './useRightChips';
import { useUpdateResource } from '@/resources/hooks/useUpdateResource';
import { useRevokeResource } from '@/resources/hooks/useRevokeResource';

export const useRightsSection = ({
  resource,
  onDelegate,
}: {
  resource: ServiceResource;
  onDelegate?: () => void;
}) => {
  const { t } = useTranslation();
  const delegateRights = useDelegateRights();
  const updateResource = useUpdateResource();

  /// State variables

  const [rights, setRights] = useState<ChipRight[]>([]);
  const [currentRights, setCurrentRights] = useState<string[]>([]);
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
  const { data: resourceRights, isFetching: isResourceRightsFetching } = useGetResourceRightsQuery(
    {
      actingParty: actingParty?.partyUuid || '',
      from: fromParty?.partyUuid || '',
      to: toParty?.partyUuid || '',
      resourceId: resource.identifier,
    },
    { skip: !toParty || !fromParty || !actingParty || !resource.identifier },
  );
  const { data: reportee } = useGetReporteeQuery();
  const {
    data: delegationCheckedActions,
    isError: isDelegationCheckError,
    error: delegationCheckError,
    isLoading: isDelegationCheckLoading,
  } = useDelegationCheckQuery(resource.identifier, { skip: !resource.identifier });

  /// Computed values

  const hasUnsavedChanges = !arraysEqualUnordered(
    rights.filter((r) => r.checked).map((r) => r.rightKey),
    currentRights,
  );
  const undelegableActions = rights.filter((r) => !r.delegable).map((r) => r.action);
  const toPartyName = toParty
    ? formatDisplayName({
        fullName: toParty.name,
        type: toParty.partyTypeName === PartyType.Organization ? 'company' : 'person',
      })
    : '';

  /// Useffect hooks

  // Instantiate/reset access and rights states
  useEffect(() => {
    if (resourceRights && !isResourceRightsFetching) {
      if (resourceRights.rules.length > 0) {
        setHasAccess(true);
        const rightKeys = resourceRights.rules.map((r) => r.key);
        setCurrentRights(rightKeys);
      } else {
        setHasAccess(false);
        setCurrentRights([]);
      }
    }
  }, [resourceRights, isResourceRightsFetching, resource.identifier]);

  // Instantiate/reset rights and missing access message states
  useEffect(() => {
    if (delegationCheckedActions) {
      setMissingAccess(getMissingAccessMessage(delegationCheckedActions));

      if (hasAccess) {
        const chipRights: ChipRight[] = mapRightsToChipRights(
          delegationCheckedActions,
          (right) => currentRights.some((key) => key === right.actionKey),
          resource.resourceOwnerOrgcode,
        );
        setRights(chipRights);
      } else {
        const chipRights: ChipRight[] = mapRightsToChipRights(
          delegationCheckedActions,
          (right) => right.result === true,
          resource.resourceOwnerOrgcode,
        );
        setRights(chipRights);
      }
    }
  }, [delegationCheckedActions, resource.identifier, hasAccess, currentRights]);

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

  const getMissingAccessMessage = useCallback(
    (response: DelegationCheckedAction[]) => {
      const hasMissingRoleAccess = response.some((right) =>
        right.reasons.some(
          (reason) =>
            reason.reasonKey === ErrorCode.MissingRoleAccess ||
            reason.reasonKey === ErrorCode.MissingRightAccess,
        ),
      );
      const hasMissingSrrRightAccess = response.some(
        (right) =>
          !hasMissingRoleAccess &&
          right.reasons.some(
            (reason) =>
              reason.reasonKey === ErrorCode.MissingSrrRightAccess ||
              reason.reasonKey === ErrorCode.AccessListValidationFail,
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
  };
};

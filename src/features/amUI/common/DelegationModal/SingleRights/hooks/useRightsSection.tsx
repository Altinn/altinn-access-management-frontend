import { RightStatus } from '@/dataObjects/dtos/resourceDelegation';
import { useDelegateRights } from '@/resources/hooks/useDelegateRights';
import { formatDisplayName } from '@altinn/altinn-components';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChipRight, mapRightsToChipRights } from './rightsUtils';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import {
  DelegationCheckedRight,
  ServiceResource,
  useDelegationCheckQuery,
  useGetSingleRightsForRightholderQuery,
} from '@/rtk/features/singleRights/singleRightsApi';
import { arraysEqualUnordered } from '@/resources/utils';
import { PartyType, useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { usePartyRepresentation } from '../../../PartyRepresentationContext/PartyRepresentationContext';
import { ErrorCode } from '@/resources/utils/errorCodeUtils';

import classes from '../ResourceInfo.module.css';
import { useRightChips } from './useRightChips';
import { useUpdateResource } from '@/resources/hooks/useUpdateResource';

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
  const [delegationError, setDelegationError] = useState<string | null>(null);
  const [missingAccess, setMissingAccess] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isActionSuccess, setIsActionSuccess] = useState(false);

  /// Hooks and data fetching

  const { toParty, fromParty } = usePartyRepresentation();
  const { data: delegatedResources, isFetching } = useGetSingleRightsForRightholderQuery(
    {
      party: getCookie('AltinnPartyId'),
      userId: toParty?.partyId.toString() || '',
    },
    { skip: !toParty },
  );
  const { data: reportee } = useGetReporteeQuery();
  const {
    data: delegationCheckedRights,
    isError: isDelegationCheckError,
    error: delegationCheckError,
  } = useDelegationCheckQuery(resource.identifier);

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
    if (delegatedResources && !isFetching) {
      const resourceDelegation =
        !!delegatedResources &&
        delegatedResources.find(
          (delegation) => delegation.resource.identifier === resource.identifier,
        );
      if (resourceDelegation) {
        setHasAccess(true);
        const rightKeys = resourceDelegation.delegation.rightDelegationResults.map(
          (r) => r.rightKey,
        );
        setCurrentRights(rightKeys);
      } else {
        setHasAccess(false);
        setCurrentRights([]);
      }
    }
  }, [delegatedResources, isFetching, resource.identifier]);

  // Instantiate/reset rights and missing access message states
  useEffect(() => {
    if (delegationCheckedRights) {
      setMissingAccess(getMissingAccessMessage(delegationCheckedRights));

      if (hasAccess) {
        const chipRights: ChipRight[] = mapRightsToChipRights(
          delegationCheckedRights,
          (right) => currentRights.some((key) => key === right.rightKey),
          resource.resourceOwnerOrgcode,
        );
        setRights(chipRights);
      } else {
        const chipRights: ChipRight[] = mapRightsToChipRights(
          delegationCheckedRights,
          (right) => right.status === RightStatus.Delegable,
          resource.resourceOwnerOrgcode,
        );
        setRights(chipRights);
      }
    }
  }, [delegationCheckedRights, resource.identifier, hasAccess, currentRights]);

  /// Functions

  const onSuccess = () => {
    setIsActionLoading(false);
    setIsActionSuccess(true);
    setTimeout(() => setIsActionSuccess(false), 2000);
    onDelegate?.();
  };

  const resetActionStates = () => {
    setIsActionLoading(false);
    setIsActionSuccess(false);
    setDelegationError(null);
    setMissingAccess(null);
  };

  const getMissingAccessMessage = useCallback(
    (response: DelegationCheckedRight[]) => {
      const hasMissingRoleAccess = response.some((right) =>
        right.reasonCodes.some(
          (code) => code === ErrorCode.MissingRoleAccess || code === ErrorCode.MissingRightAccess,
        ),
      );
      const hasMissingSrrRightAccess = response.some(
        (right) =>
          !hasMissingRoleAccess &&
          right.reasonCodes.some(
            (code) =>
              code === ErrorCode.MissingSrrRightAccess ||
              code === ErrorCode.AccessListValidationFail,
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
      resetActionStates();
      updateResource(resource.identifier, actionKeysToDelegate, onSuccess, () => {
        setIsActionLoading(false);
        setDelegationError(
          t('delegation_modal.technical_error_message.all_failed', { name: toPartyName }),
        );
      });
    }
  };

  const delegateChosenRights = () => {
    const actionKeysToDelegate = rights
      .filter((right: ChipRight) => right.checked)
      .map((r) => r.rightKey);

    if (fromParty && toParty) {
      resetActionStates();
      delegateRights(actionKeysToDelegate, resource.identifier, onSuccess, () => {
        setIsActionLoading(false);
        setDelegationError(
          t('delegation_modal.technical_error_message.all_failed', { name: toPartyName }),
        );
      });
    }
  };

  const { chips } = useRightChips(rights, setRights, classes.chip);

  return {
    chips,
    saveEditedRights,
    delegateChosenRights,
    undelegableActions,
    rights,
    hasUnsavedChanges,
    hasAccess,
    isDelegationCheckError,
    delegationCheckError,
    delegationError,
    missingAccess,
    isActionLoading,
    isActionSuccess,
  };
};

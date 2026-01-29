import { RightStatus, DelegationResult } from '@/dataObjects/dtos/resourceDelegation';
import { useDelegateRights } from '@/resources/hooks/useDelegateRights';
import { useEditResource } from '@/resources/hooks/useEditResource';
import { BFFDelegatedStatus } from '@/rtk/features/singleRights/singleRightsSlice';
import { SnackbarDuration, DsChip, useSnackbar } from '@altinn/altinn-components';
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
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { usePartyRepresentation } from '../../../PartyRepresentationContext/PartyRepresentationContext';
import { ErrorCode } from '@/resources/utils/errorCodeUtils';

import classes from '../ResourceInfo.module.css';
import { useRightChips } from './useRightChips';

export const useRightsSection = ({
  resource,
  onDelegate,
}: {
  resource: ServiceResource;
  onDelegate?: () => void;
}) => {
  const { t } = useTranslation();
  const delegateRights = useDelegateRights();
  const editResource = useEditResource();

  /// State variables

  const [rights, setRights] = useState<ChipRight[]>([]);
  const [currentRights, setCurrentRights] = useState<string[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [delegationError, setDelegationError] = useState<string | null>(null);
  const [missingAccess, setMissingAccess] = useState<string | null>(null);

  /// Hooks and data fetching

  const { openSnackbar } = useSnackbar();
  const { toParty, fromParty, actingParty } = usePartyRepresentation();
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
    const newRights = rights.filter((r) => r.checked).map((r) => r.rightKey);
    if (fromParty && toParty) {
      setDelegationError(null);
      editResource(
        resource.identifier,
        fromParty?.partyUuid,
        toParty?.partyUuid,
        currentRights,
        newRights,
        () => {
          openSnackbar({
            message: t('delegation_modal.edit_success', { name: toParty?.name }),
            color: 'success',
          });
          onDelegate?.();
        },
        () =>
          openSnackbar({
            message: t('delegation_modal.error_message', { name: toParty?.name }),
            color: 'danger',
            duration: SnackbarDuration.infinite,
          }),
      );
    }
  };

  const delegateChosenRights = () => {
    const rightsToDelegate = rights.filter((right: ChipRight) => right.checked);
    console.log('Delegating rights:', rightsToDelegate);
    console.log('resource:', resource.identifier);

    delegateRights(
      rightsToDelegate,
      toParty?.partyUuid ?? '',
      fromParty?.partyUuid ?? '',
      actingParty?.partyUuid ?? '',
      resource.identifier,
      (response: DelegationResult) => {
        setDelegationError(null);

        openSnackbar({
          message: t('delegation_modal.success_message', { name: toParty?.name }),
          color: 'success',
        });

        const notDelegatedActions = response.rightDelegationResults.filter(
          (result) =>
            rightsToDelegate.find((r) => r.rightKey === result.rightKey) &&
            result.status === BFFDelegatedStatus.NotDelegated,
        );

        if (notDelegatedActions.length > 0) {
          setDelegationError(
            t('delegation_modal.technical_error_message.some_failed', {
              actions: notDelegatedActions.map((action) => action.action).join(', '),
            }),
          );
        } else {
          onDelegate?.();
        }
      },
      () => {
        setDelegationError(
          t('delegation_modal.technical_error_message.all_failed', { name: toParty?.name }),
        );
      },
    );
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
  };
};

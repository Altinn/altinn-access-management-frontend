import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useInstanceDelegationCheckQuery } from '@/rtk/features/instanceApi';
import { useGetResourceRightsMetaQuery } from '@/rtk/features/singleRights/singleRightsApi';
import { useGetIsAdminQuery, useGetIsInstanceAdminQuery } from '@/rtk/features/userInfoApi';
import {
  ChipRight,
  mapRightsToChipRights,
} from '../common/DelegationModal/SingleRights/hooks/rightsUtils';
import { createErrorDetails } from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';

export const getRightsSummaryTitle = (
  rights: ChipRight[],
  t: ReturnType<typeof useTranslation>['t'],
): string => {
  const checkedCount = rights.filter((r) => r.checked).length;
  if (checkedCount === rights.length) {
    return t('delegation_modal.actions.access_to_all');
  }
  return t('delegation_modal.actions.partial_access', {
    count: checkedCount,
    total: rights.length,
  });
};

export const useInstanceRights = ({
  resourceId,
  instanceUrn,
  isOpen,
}: {
  resourceId: string;
  instanceUrn: string;
  isOpen: boolean;
}) => {
  const { actingParty } = usePartyRepresentation();
  const {
    data: isAdmin,
    isLoading: isAdminLoading,
    isFetching: isAdminFetching,
    isError: isAdminError,
    error: isAdminErrorObj,
  } = useGetIsAdminQuery();
  const {
    data: isInstanceAdmin,
    isLoading: isInstanceAdminLoading,
    isFetching: isInstanceAdminFetching,
    isError: isInstanceAdminError,
    error: isInstanceAdminErrorObj,
  } = useGetIsInstanceAdminQuery();
  const [rights, setRights] = useState<ChipRight[]>([]);

  const {
    data: rightsMeta,
    isLoading: isRightsMetaLoading,
    isFetching: isRightsMetaFetching,
    isError: isRightsMetaError,
    error: rightsMetaError,
  } = useGetResourceRightsMetaQuery({ resourceId }, { skip: !isOpen || !resourceId });

  const isAdminStateLoading =
    isAdminLoading || isAdminFetching || isInstanceAdminLoading || isInstanceAdminFetching;
  const isAdminStateError = isAdminError || isInstanceAdminError;
  const hasAdminAccess = Boolean(isAdmin || isInstanceAdmin);
  const shouldCheckDelegation = hasAdminAccess && !isAdminStateLoading && !isAdminStateError;

  const {
    data: delegationCheckedRights,
    isLoading: isDelegationCheckLoading,
    isFetching: isDelegationCheckFetching,
    isError: isDelegationCheckError,
    error: delegationCheckError,
  } = useInstanceDelegationCheckQuery(
    {
      party: actingParty?.partyUuid || '',
      resource: resourceId,
      instance: instanceUrn,
    },
    {
      skip:
        !shouldCheckDelegation || !isOpen || !actingParty?.partyUuid || !resourceId || !instanceUrn,
    },
  );

  const isLoading =
    isOpen &&
    (isAdminStateLoading ||
      isRightsMetaLoading ||
      isRightsMetaFetching ||
      (shouldCheckDelegation && (isDelegationCheckLoading || isDelegationCheckFetching)));
  const isError = isAdminStateError || isRightsMetaError || isDelegationCheckError;
  const errorDetails =
    createErrorDetails(isAdminErrorObj) ??
    createErrorDetails(isInstanceAdminErrorObj) ??
    createErrorDetails(rightsMetaError) ??
    createErrorDetails(delegationCheckError) ??
    (isError
      ? {
          status: 'unknown',
          time: new Date().toISOString(),
        }
      : null);

  // Wait for every upstream query to settle before treating missing rights data as a real empty set.
  const hasSettledRightsDependencies =
    !isLoading &&
    !isError &&
    rightsMeta !== undefined &&
    (!shouldCheckDelegation || delegationCheckedRights !== undefined);

  const mappedRights = useMemo<ChipRight[] | null>(() => {
    if (!hasSettledRightsDependencies) return null;
    if (!shouldCheckDelegation || !rightsMeta) return [];

    return mapRightsToChipRights(rightsMeta, delegationCheckedRights, {
      isChecked: (right) => right.result === true,
    });
  }, [delegationCheckedRights, hasSettledRightsDependencies, rightsMeta, shouldCheckDelegation]);

  useEffect(() => {
    if (mappedRights === null) return;
    setRights(mappedRights);
  }, [mappedRights]);

  const resetRights = () => setRights(mappedRights ?? []);

  return { rights, setRights, resetRights, isLoading, isError, errorDetails };
};

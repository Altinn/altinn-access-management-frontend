import { useEffect, useMemo, useState } from 'react';
import type { useTranslation } from 'react-i18next';

import {
  useDelegationCheckQuery,
  useGetResourceRightsMetaQuery,
} from '@/rtk/features/singleRights/singleRightsApi';

import { createErrorDetails } from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { mapRightsToChipRights, type ChipRight } from '../common/DelegationModal/utils/rightsUtils';

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

/**
 * The actions a service offers, pre-checked with the ones the reportee may actually pass on.
 *
 * Neither the rights meta nor the delegation check is recipient-specific for a single service, so
 * the actions can be picked before the recipient exists. That is what lets the add-user flow give
 * the service in one step instead of creating the user first and delegating afterwards.
 */
export const useServiceRights = ({
  resourceId,
  isEnabled = true,
}: {
  resourceId: string;
  isEnabled?: boolean;
}) => {
  const [rights, setRights] = useState<ChipRight[]>([]);
  const skip = !isEnabled || !resourceId;

  const {
    data: rightsMeta,
    isLoading: isRightsMetaLoading,
    isError: isRightsMetaError,
    error: rightsMetaError,
  } = useGetResourceRightsMetaQuery({ resourceId }, { skip });

  const {
    data: delegationCheckedRights,
    isLoading: isDelegationCheckLoading,
    isError: isDelegationCheckError,
    error: delegationCheckError,
  } = useDelegationCheckQuery({ resourceId }, { skip });

  const isRightsMetaEmpty =
    !isRightsMetaLoading &&
    !isRightsMetaError &&
    Array.isArray(rightsMeta) &&
    rightsMeta.length === 0;

  const errorDetails = useMemo(() => {
    if (!isRightsMetaError && !isDelegationCheckError && !isRightsMetaEmpty) {
      return null;
    }
    const details = createErrorDetails(rightsMetaError ?? delegationCheckError);
    return {
      status: details?.status ?? (isRightsMetaEmpty ? 'empty response' : 'no status'),
      time: details?.time ?? new Date().toISOString(),
    };
  }, [
    isRightsMetaError,
    isDelegationCheckError,
    isRightsMetaEmpty,
    rightsMetaError,
    delegationCheckError,
  ]);

  const defaultRights = useMemo(() => {
    if (!rightsMeta || rightsMeta.length === 0) {
      return null;
    }
    if (!delegationCheckedRights && !isDelegationCheckError) {
      return null;
    }
    // Everything the reportee is allowed to pass on starts checked, so giving the whole service is
    // the default and narrowing it is the deliberate act.
    return mapRightsToChipRights(rightsMeta, delegationCheckedRights, {
      isChecked: (right) => right.result === true,
    });
  }, [rightsMeta, delegationCheckedRights, isDelegationCheckError]);

  useEffect(() => {
    if (defaultRights) {
      setRights(defaultRights);
    }
  }, [defaultRights]);

  const resetRights = () => setRights(defaultRights ?? []);

  return {
    rights,
    setRights,
    resetRights,
    isLoading: isRightsMetaLoading || isDelegationCheckLoading,
    errorDetails,
  };
};

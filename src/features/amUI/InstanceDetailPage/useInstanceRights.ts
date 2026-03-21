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
  const { data: isAdmin } = useGetIsAdminQuery();
  const { data: isInstanceAdmin } = useGetIsInstanceAdminQuery();
  const [rights, setRights] = useState<ChipRight[]>([]);

  const {
    data: rightsMeta,
    isLoading: isRightsMetaLoading,
    error: rightsMetaError,
  } = useGetResourceRightsMetaQuery({ resourceId }, { skip: !isOpen || !resourceId });

  const {
    data: delegationCheckedRights,
    isLoading: isDelegationCheckLoading,
    error: delegationCheckError,
  } = useInstanceDelegationCheckQuery(
    {
      party: actingParty?.partyUuid || '',
      resource: resourceId,
      instance: instanceUrn,
    },
    {
      skip:
        (!isAdmin && !isInstanceAdmin) ||
        !isOpen ||
        !actingParty?.partyUuid ||
        !resourceId ||
        !instanceUrn,
    },
  );

  const mappedRights = useMemo(() => {
    if (!rightsMeta || !delegationCheckedRights) return [];
    return mapRightsToChipRights(rightsMeta, delegationCheckedRights, {
      isChecked: (right) => right.result === true,
    });
  }, [delegationCheckedRights, rightsMeta]);

  useEffect(() => {
    setRights(mappedRights);
  }, [mappedRights]);

  const resetRights = () => setRights(mappedRights);

  const isLoading = isRightsMetaLoading || isDelegationCheckLoading;
  const errorDetails =
    createErrorDetails(rightsMetaError) ?? createErrorDetails(delegationCheckError);

  return { rights, setRights, resetRights, isLoading, errorDetails };
};

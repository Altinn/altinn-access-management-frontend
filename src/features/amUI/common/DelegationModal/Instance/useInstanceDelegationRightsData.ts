import { useEffect, useMemo, useState } from 'react';

import {
  useInstanceDelegationCheckQuery,
  useGetInstanceRightsQuery,
} from '@/rtk/features/instanceApi';
import { useGetResourceRightsMetaQuery } from '@/rtk/features/singleRights/singleRightsApi';
import { createErrorDetails } from '@/features/amUI/common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';

import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { mapRightsToChipRights, type ChipRight } from '../SingleRights/hooks/rightsUtils';

export const useInstanceDelegationRightsData = ({
  resourceId,
  instanceUrn,
  isEnabled = true,
  fromPartyUuid,
  toPartyUuid,
}: {
  resourceId: string;
  instanceUrn: string;
  isEnabled?: boolean;
  fromPartyUuid?: string;
  toPartyUuid?: string;
}) => {
  const { actingParty } = usePartyRepresentation();
  const [rights, setRights] = useState<ChipRight[]>([]);

  const shouldLoadInstanceRights = !!fromPartyUuid && !!toPartyUuid;
  const shouldSkipRightsMetaQuery = !isEnabled || !resourceId;
  const shouldSkipDelegationCheckQuery =
    !isEnabled || !actingParty?.partyUuid || !resourceId || !instanceUrn;
  const shouldSkipInstanceRightsQuery =
    !isEnabled ||
    !actingParty?.partyUuid ||
    !fromPartyUuid ||
    !toPartyUuid ||
    !resourceId ||
    !instanceUrn;

  const {
    data: rightsMeta,
    isLoading: isRightsMetaLoading,
    isError: isRightsMetaError,
    error: rightsMetaError,
  } = useGetResourceRightsMetaQuery({ resourceId }, { skip: shouldSkipRightsMetaQuery });

  const {
    data: delegationCheckedRights,
    isLoading: isDelegationCheckLoading,
    isError: isDelegationCheckError,
    error: delegationCheckError,
  } = useInstanceDelegationCheckQuery(
    {
      party: actingParty?.partyUuid || '',
      resource: resourceId,
      instance: instanceUrn,
    },
    { skip: shouldSkipDelegationCheckQuery },
  );

  const {
    data: instanceRights,
    isLoading: isInstanceRightsLoading,
    isFetching: isInstanceRightsFetching,
    error: instanceRightsError,
  } = useGetInstanceRightsQuery(
    {
      party: actingParty?.partyUuid || '',
      from: fromPartyUuid || '',
      to: toPartyUuid || '',
      resource: resourceId,
      instance: instanceUrn,
    },
    { skip: shouldSkipInstanceRightsQuery },
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
  const instanceRightsErrorDetails = createErrorDetails(instanceRightsError);

  const hasAccess = useMemo(() => {
    if (!shouldLoadInstanceRights || isInstanceRightsFetching || !instanceRights) {
      return false;
    }

    return instanceRights.directRights.length > 0 || instanceRights.indirectRights.length > 0;
  }, [instanceRights, isInstanceRightsFetching, shouldLoadInstanceRights]);

  const defaultRights = useMemo(() => {
    if (!rightsMeta || rightsMeta.length === 0) {
      return null;
    }

    if (!delegationCheckedRights && !isDelegationCheckError) {
      return null;
    }

    if (shouldLoadInstanceRights) {
      if (!instanceRights) {
        return null;
      }

      if (hasAccess) {
        return mapRightsToChipRights(rightsMeta, delegationCheckedRights, {
          isDelegated: (right) =>
            instanceRights.directRights.some((r) => r.right.key === right.right.key) ||
            instanceRights.indirectRights.some((r) => r.right.key === right.right.key),
          isInherited: (rightKey) =>
            instanceRights.indirectRights.some((r) => r.right.key === rightKey),
        });
      }
    }

    return mapRightsToChipRights(rightsMeta, delegationCheckedRights, {
      isChecked: (right) => right.result === true,
    });
  }, [
    rightsMeta,
    delegationCheckedRights,
    isDelegationCheckError,
    shouldLoadInstanceRights,
    instanceRights,
    hasAccess,
  ]);

  useEffect(() => {
    if (!defaultRights) {
      return;
    }

    setRights(defaultRights);
  }, [defaultRights]);

  const resetRights = () => {
    setRights(defaultRights ?? []);
  };

  return {
    rights,
    setRights,
    resetRights,
    hasAccess,
    isLoading,
    isDelegationCheckLoading,
    isDelegationCheckError,
    delegationCheckError,
    delegationCheckedRights,
    rightsMetaTechnicalErrorDetails,
    instanceRightsErrorDetails,
  };
};

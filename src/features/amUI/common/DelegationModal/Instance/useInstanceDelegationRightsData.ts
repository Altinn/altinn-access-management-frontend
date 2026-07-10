import { useEffect, useMemo, useState } from 'react';

import {
  useInstanceDelegationCheckQuery,
  useGetInstanceRightsQuery,
} from '@/rtk/features/instanceApi';
import { useGetResourceRightsMetaQuery } from '@/rtk/features/singleRights/singleRightsApi';
import { createErrorDetails } from '@/features/amUI/common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';

import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { mapRightsToChipRights, type ChipRight } from '../utils/rightsUtils';

export const useInstanceDelegationRightsData = ({
  resourceId,
  instanceUrn,
  isEnabled = true,
  fromPartyUuid,
  toPartyUuid,
  mode = 'edit',
}: {
  resourceId: string;
  instanceUrn: string;
  isEnabled?: boolean;
  fromPartyUuid?: string;
  toPartyUuid?: string;
  mode?: 'edit' | 'delegate';
}) => {
  const { actingParty } = usePartyRepresentation();
  const [rights, setRights] = useState<ChipRight[]>([]);

  const shouldLoadInstanceRights = !!fromPartyUuid && !!toPartyUuid;
  const shouldSkipRightsMetaQuery = !isEnabled || !resourceId;
  const shouldSkipDelegationCheckQuery =
    !isEnabled || !actingParty?.partyUuid || !resourceId || !instanceUrn;

  const shouldSkipInstanceRightsQuery =
    mode === 'delegate' ||
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

  const rightsMetaTechnicalErrorDetails = useMemo(() => {
    if (!isRightsMetaError && !isRightsMetaEmpty) {
      return null;
    }
    const errorDetails = createErrorDetails(rightsMetaError);
    return {
      status: errorDetails?.status ?? (isRightsMetaEmpty ? 'empty response' : 'no status'),
      time: errorDetails?.time ?? new Date().toISOString(),
    };
  }, [isRightsMetaError, isRightsMetaEmpty, rightsMetaError]);

  const instanceRightsErrorDetails = useMemo(
    () => createErrorDetails(instanceRightsError),
    [instanceRightsError],
  );

  const hasAccess = useMemo(() => {
    if (!shouldLoadInstanceRights || isInstanceRightsFetching || !instanceRights) {
      return false;
    }

    return instanceRights.directRights.length > 0 || instanceRights.indirectRights.length > 0;
  }, [instanceRights, isInstanceRightsFetching, shouldLoadInstanceRights]);

  const hasDirectAccess = useMemo(() => {
    if (!shouldLoadInstanceRights || isInstanceRightsFetching || !instanceRights) {
      return false;
    }

    return instanceRights.directRights.length > 0;
  }, [instanceRights, isInstanceRightsFetching, shouldLoadInstanceRights]);

  const defaultRights = useMemo(() => {
    if (!rightsMeta || rightsMeta.length === 0) {
      return null;
    }

    if (!delegationCheckedRights && !isDelegationCheckError) {
      return null;
    }

    if (shouldLoadInstanceRights && mode === 'edit') {
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
    shouldLoadInstanceRights,
    mode,
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
    hasDirectAccess,
    isLoading: isLoading || isDelegationCheckLoading,
    isDelegationCheckLoading,
    delegationCheckError,
    delegationCheckedRights,
    errorDetails: rightsMetaTechnicalErrorDetails || instanceRightsErrorDetails,
  };
};

import { useMemo, useState } from 'react';

import {
  useDelegationCheckQuery,
  useGetResourceRightsMetaQuery,
} from '@/rtk/features/singleRights/singleRightsApi';
import { useInstanceDelegationCheckQuery } from '@/rtk/features/instanceApi';

import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { createErrorDetails } from '../TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { mapRightsToChipRights, type ChipRight } from '../DelegationModal/utils/rightsUtils';

/**
 * The actions something offers, pre-checked with the ones the reportee may actually pass on.
 *
 * Neither the rights meta nor the delegation check is recipient-specific, so the actions can be
 * picked before the recipient exists. That is what lets the add-user flows give access in one step
 * instead of creating the user first and delegating afterwards.
 *
 * Pass an instanceUrn to ask about a single instance of the resource rather than the resource as a
 * whole; that is the only thing that differs between the two, and it only changes which delegation
 * check is asked.
 */
export const useDelegableRights = ({
  resourceId,
  instanceUrn,
  isEnabled = true,
}: {
  resourceId: string;
  instanceUrn?: string;
  isEnabled?: boolean;
}) => {
  const { actingParty } = usePartyRepresentation();
  const [rights, setRights] = useState<ChipRight[]>([]);

  const isInstance = !!instanceUrn;
  const skip = !isEnabled || !resourceId;

  const {
    data: rightsMeta,
    isLoading: isRightsMetaLoading,
    isError: isRightsMetaError,
    error: rightsMetaError,
  } = useGetResourceRightsMetaQuery({ resourceId }, { skip });

  // Hooks cannot be called conditionally, so both checks are declared and the wrong one is skipped.
  const resourceCheck = useDelegationCheckQuery({ resourceId }, { skip: skip || isInstance });

  const instanceCheck = useInstanceDelegationCheckQuery(
    {
      party: actingParty?.partyUuid || '',
      resource: resourceId,
      instance: instanceUrn || '',
    },
    { skip: skip || !isInstance || !actingParty?.partyUuid },
  );

  const {
    data: delegationCheckedRights,
    isLoading: isDelegationCheckLoading,
    isError: isDelegationCheckError,
    error: delegationCheckError,
  } = isInstance ? instanceCheck : resourceCheck;

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
      traceId: details?.traceId,
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
    // Everything the reportee is allowed to pass on starts checked, so giving everything is the
    // default and narrowing it is the deliberate act.
    return mapRightsToChipRights(rightsMeta, delegationCheckedRights, {
      isChecked: (right) => right.result === true,
    });
  }, [rightsMeta, delegationCheckedRights, isDelegationCheckError]);

  // Seeding the editable copy is "adjusting state when props change": done while rendering rather
  // than from an effect, so the defaults are there on the first paint and nothing renders twice.
  const [seededFrom, setSeededFrom] = useState<ChipRight[] | null>(null);
  if (defaultRights && defaultRights !== seededFrom) {
    setSeededFrom(defaultRights);
    setRights(defaultRights);
  }

  // The caller outlives the dialog, so it resets the picks when the dialog closes.
  const resetRights = () => setRights(defaultRights ?? []);

  return {
    rights,
    setRights,
    resetRights,
    isLoading: isRightsMetaLoading || isDelegationCheckLoading,
    errorDetails,
  };
};

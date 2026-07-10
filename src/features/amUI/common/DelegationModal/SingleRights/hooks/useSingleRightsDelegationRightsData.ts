import { useEffect, useState } from 'react';

import {
  type ServiceResource,
  useDelegationCheckQuery,
  useGetResourceRightsMetaQuery,
  useGetResourceRightsQuery,
} from '@/rtk/features/singleRights/singleRightsApi';
import { usePartyRepresentation } from '../../../PartyRepresentationContext/PartyRepresentationContext';
import { createErrorDetails } from '@/features/amUI/common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { mapRightsToChipRights, type ChipRight } from '../../utils/rightsUtils';
import { useHasResourceCheck } from './useHasResourceCheck';

export const useSingleRightsDelegationRightsData = ({
  resource,
  isRequest = false,
}: {
  resource: ServiceResource;
  isRequest?: boolean;
}) => {
  const { toParty, fromParty, actingParty } = usePartyRepresentation();
  const [rights, setRights] = useState<ChipRight[]>([]);
  const [hasAccess, setHasAccess] = useState(false);

  const { hasResourceAccess, isLoading: isResourceAccessLoading } = useHasResourceCheck(
    resource.identifier,
  );

  const {
    data: resourceRights,
    isFetching: isResourceRightsFetching,
    isLoading: isResourceRightsLoading,
  } = useGetResourceRightsQuery(
    {
      actingParty: actingParty?.partyUuid || '',
      from: fromParty?.partyUuid || '',
      to: toParty?.partyUuid || '',
      resourceId: resource.identifier,
    },
    { skip: !toParty || !fromParty || !actingParty || !resource.identifier || !hasResourceAccess },
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
  } = useDelegationCheckQuery(resource.identifier, {
    skip: !resource.identifier || isRequest,
  });

  const isLoading =
    isResourceAccessLoading ||
    isRightsMetaLoading ||
    isDelegationCheckLoading ||
    (hasResourceAccess && isResourceRightsLoading);

  const isRightsMetaEmpty =
    !isRightsMetaLoading &&
    !isRightsMetaError &&
    Array.isArray(rightsMeta) &&
    rightsMeta.length === 0;

  const rightsMetaErrorDetails = isRightsMetaError ? createErrorDetails(rightsMetaError) : null;
  const rightsMetaTechnicalErrorDetails = isRightsMetaEmpty
    ? { status: 'empty response', time: new Date().toISOString() }
    : isRightsMetaError
      ? {
          status: rightsMetaErrorDetails?.status ?? 'no status',
          time: rightsMetaErrorDetails?.time ?? new Date().toISOString(),
        }
      : null;

  useEffect(() => {
    if (!isResourceRightsFetching) {
      const hasDirectOrIndirectRights =
        hasResourceAccess &&
        resourceRights &&
        (resourceRights.directRights.length > 0 || resourceRights.indirectRights.length > 0);
      setHasAccess(!!hasDirectOrIndirectRights);
    }
  }, [resourceRights, isResourceRightsFetching, hasResourceAccess]);

  useEffect(() => {
    if (!rightsMeta || rightsMeta.length === 0) return;
    if (!delegationCheckedActions && !isDelegationCheckError && !isRequest) return;

    if (hasAccess && resourceRights) {
      setRights(
        mapRightsToChipRights(rightsMeta, delegationCheckedActions, {
          isDelegated: (right) =>
            resourceRights.directRights.some((r) => r.right.key === right.right.key) ||
            resourceRights.indirectRights.some((r) => r.right.key === right.right.key),
          isInherited: (rightKey) =>
            resourceRights.indirectRights.some((r) => r.right.key === rightKey),
        }),
      );
    } else {
      setRights(
        mapRightsToChipRights(rightsMeta, delegationCheckedActions, {
          isChecked: (right) => right.result === true || isRequest === true,
        }),
      );
    }
  }, [
    rightsMeta,
    delegationCheckedActions,
    isDelegationCheckError,
    resource.identifier,
    hasAccess,
    resourceRights,
    isRequest,
  ]);

  return {
    rights,
    setRights,
    hasAccess,
    isLoading,
    isDelegationCheckLoading,
    isDelegationCheckError,
    delegationCheckError,
    delegationCheckedActions,
    rightsMetaTechnicalErrorDetails,
  };
};

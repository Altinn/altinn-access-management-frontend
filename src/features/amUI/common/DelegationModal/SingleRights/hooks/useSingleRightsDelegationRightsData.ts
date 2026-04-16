import { useEffect, useState } from 'react';

import {
  type ServiceResource,
  useDelegationCheckQuery,
  useGetResourceRightsMetaQuery,
  useGetResourceRightsQuery,
} from '@/rtk/features/singleRights/singleRightsApi';
import { usePartyRepresentation } from '../../../PartyRepresentationContext/PartyRepresentationContext';
import { createErrorDetails } from '@/features/amUI/common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { mapRightsToChipRights } from '../../utils/rightsUtils';
import type { ChipRight } from '../../types/ChipRight';
import { useHasResourceCheck } from './useHasResourceCheck';

/**
 * Fetches and derives all rights data needed to display a resource's rights in
 * the delegation modal.
 */
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

  // Skip delegation check in the request flow – the party is requesting access, not granting it
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

  // An empty array from rightsMeta is treated the same as an error – nothing to show
  const isRightsMetaEmpty =
    !isRightsMetaLoading &&
    !isRightsMetaError &&
    Array.isArray(rightsMeta) &&
    rightsMeta.length === 0;

  // Error details for the technical error display shown to users
  const rightsMetaTechnicalErrorDetails = isRightsMetaEmpty
    ? {
        status: 'empty response',
        time: new Date().toISOString(),
      }
    : isRightsMetaError
      ? createErrorDetails(rightsMetaError)
      : null;

  // Determine whether the rightholder currently has access to this resource
  useEffect(() => {
    if (!isResourceRightsFetching) {
      const hasDirectOrIndirectRights =
        hasResourceAccess &&
        resourceRights &&
        (resourceRights.directRights.length > 0 || resourceRights.indirectRights.length > 0);
      setHasAccess(!!hasDirectOrIndirectRights);
    }
  }, [resourceRights, isResourceRightsFetching, hasResourceAccess]);

  // Build the list of ChipRight
  useEffect(() => {
    if (!rightsMeta || rightsMeta.length === 0) return;

    if (!delegationCheckedActions && !isDelegationCheckError && !isRequest) return;

    if (hasAccess && resourceRights) {
      // Rightholder has access – reflect the current state
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
      // No access yet – select allowed rights, or all rights in request mode.
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

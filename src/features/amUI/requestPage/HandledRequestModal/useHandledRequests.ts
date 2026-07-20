import { useState, useEffect, useMemo } from 'react';
import type { Request, ProcessedStatus } from '../types';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import {
  useGetEnrichedReceivedResourceRequestsQuery,
  useGetEnrichedReceivedPackageRequestsQuery,
  useGetEnrichedSentResourceRequestsQuery,
  useGetEnrichedSentPackageRequestsQuery,
  type EnrichedResourceRequest,
  type EnrichedPackageRequest,
  type RequestStatus,
} from '@/rtk/features/requestApi';
import { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { AccessPackage } from '@/rtk/features/accessPackageApi';

export type HandledDirection = 'sent' | 'received';

export type HandledOutcome = {
  status: ProcessedStatus;
  handledAt: string;
  handledByName?: string;
};

const handledStatus: RequestStatus[] = ['Approved', 'Rejected'];

const toProcessedStatus = (status: RequestStatus): ProcessedStatus | undefined => {
  if (status === 'Approved') return 'approved';
  if (status === 'Rejected') return 'rejected';
  return undefined;
};

type SnapshotRequests = {
  resourceRequests: EnrichedResourceRequest[];
  packageRequests: EnrichedPackageRequest[];
};

/**
 * Read-only sibling of `useRequestReview` for already-handled (Approved/Rejected) requests. It loads
 * the enriched requests for the counterparty, keeps a stable snapshot while the modal is open, and
 * derives each item's outcome (status, handled date, handler name) directly from the loaded data —
 * no mutations, delegation checks, or bulk actions.
 */
export const useHandledRequests = (
  request: Request | null,
  direction: HandledDirection,
  onClose: () => void,
) => {
  const { actingParty } = usePartyRepresentation();
  const isReceived = direction === 'received';

  // All four queries are declared (rules of hooks); only the pair matching `direction` runs.
  const receivedResource = useGetEnrichedReceivedResourceRequestsQuery(
    { party: actingParty?.partyUuid || '', from: request?.partyUuid || '', status: handledStatus },
    { skip: !isReceived || !actingParty?.partyUuid || !request?.partyUuid },
  );
  const receivedPackage = useGetEnrichedReceivedPackageRequestsQuery(
    { party: actingParty?.partyUuid || '', from: request?.partyUuid || '', status: handledStatus },
    { skip: !isReceived || !actingParty?.partyUuid || !request?.partyUuid },
  );
  const sentResource = useGetEnrichedSentResourceRequestsQuery(
    { party: actingParty?.partyUuid || '', to: request?.partyUuid || '', status: handledStatus },
    { skip: isReceived || !actingParty?.partyUuid || !request?.partyUuid },
  );
  const sentPackage = useGetEnrichedSentPackageRequestsQuery(
    { party: actingParty?.partyUuid || '', to: request?.partyUuid || '', status: handledStatus },
    { skip: isReceived || !actingParty?.partyUuid || !request?.partyUuid },
  );

  const resourceQuery = isReceived ? receivedResource : sentResource;
  const packageQuery = isReceived ? receivedPackage : sentPackage;

  const resourceRequests = resourceQuery.data;
  const packageRequests = packageQuery.data;
  const isLoadingRequests = resourceQuery.isLoading || packageQuery.isLoading;
  const isFetchingRequests = resourceQuery.isFetching || packageQuery.isFetching;

  // Snapshot: capture first non-empty result, keep it stable while the modal is open so rows stay
  // mounted (focus restore on back) and don't flicker on background refetches.
  const [snapshotRequests, setSnapshotRequests] = useState<SnapshotRequests>({
    resourceRequests: [],
    packageRequests: [],
  });
  const [selectedResource, setSelectedResource] = useState<ServiceResource | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<AccessPackage | null>(null);

  // Reset when switching to a different party or direction (not on every object reference change)
  const requestPartyUuid = request?.partyUuid;
  useEffect(() => {
    setSnapshotRequests({ resourceRequests: [], packageRequests: [] });
    setSelectedResource(null);
    setSelectedPackage(null);
  }, [requestPartyUuid, direction]);

  useEffect(() => {
    if (
      !isFetchingRequests &&
      resourceRequests &&
      packageRequests &&
      snapshotRequests.resourceRequests.length === 0 &&
      snapshotRequests.packageRequests.length === 0 &&
      (resourceRequests.length > 0 || packageRequests.length > 0)
    ) {
      setSnapshotRequests({ resourceRequests, packageRequests });
    }
  }, [
    resourceRequests,
    packageRequests,
    isFetchingRequests,
    snapshotRequests.resourceRequests.length,
    snapshotRequests.packageRequests.length,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  const outcomes = useMemo(() => {
    const map: Record<string, HandledOutcome> = {};
    snapshotRequests.resourceRequests.forEach((req) => {
      const status = toProcessedStatus(req.status);
      if (status) {
        map[req.resource.identifier] = {
          status,
          handledAt: req.lastUpdated,
          handledByName: req.lastUpdatedByName,
        };
      }
    });
    snapshotRequests.packageRequests.forEach((req) => {
      const status = toProcessedStatus(req.status);
      if (status) {
        map[req.package.id] = {
          status,
          handledAt: req.lastUpdated,
          handledByName: req.lastUpdatedByName,
        };
      }
    });
    return map;
  }, [snapshotRequests]);

  const handleSelection = ({
    resource,
    package: pkg,
  }: {
    resource?: ServiceResource;
    package?: AccessPackage;
  }) => {
    if (resource) {
      setSelectedResource(resource);
      setSelectedPackage(null);
    } else if (pkg) {
      setSelectedPackage(pkg);
      setSelectedResource(null);
    }
  };

  const resetSelection = () => {
    setSelectedResource(null);
    setSelectedPackage(null);
  };

  const handleClose = () => {
    setSnapshotRequests({ resourceRequests: [], packageRequests: [] });
    setSelectedResource(null);
    setSelectedPackage(null);
    onClose();
  };

  const snapshotResources = snapshotRequests.resourceRequests.map((r) => r.resource);
  const snapshotPackages = snapshotRequests.packageRequests.map((p) => p.package);

  return {
    isLoadingRequests,
    isFetchingRequests,
    snapshotResources,
    snapshotPackages,
    selectedResource,
    selectedPackage,
    outcomes,
    handleSelection,
    resetSelection,
    handleClose,
  };
};

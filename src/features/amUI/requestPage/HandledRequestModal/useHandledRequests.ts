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

/**
 * One handled resource request. Keyed by `requestId` (not by `resource.identifier`) because the same
 * resource can be requested — and approved/rejected — multiple times, producing several distinct rows.
 */
export type HandledResourceItem = {
  requestId: string;
  resource: ServiceResource;
  outcome: HandledOutcome;
};

/**
 * One handled package request. Keyed by `requestId` (not by `package.id`) — the same package can be
 * requested and handled multiple times, producing several distinct rows.
 */
export type HandledPackageItem = {
  requestId: string;
  package: AccessPackage;
  outcome: HandledOutcome;
};

const handledStatus: RequestStatus[] = ['Approved', 'Rejected'];

const toProcessedStatus = (status: RequestStatus): ProcessedStatus | undefined => {
  if (status === 'Approved') return 'approved';
  if (status === 'Rejected') return 'rejected';
  return undefined;
};

// Most recently handled first.
const byHandledAtDesc = (a: { outcome: HandledOutcome }, b: { outcome: HandledOutcome }): number =>
  b.outcome.handledAt.localeCompare(a.outcome.handledAt);

type SnapshotRequests = {
  resourceRequests: EnrichedResourceRequest[];
  packageRequests: EnrichedPackageRequest[];
};

/**
 * Read-only sibling of `useRequestReview` for already-handled (Approved/Rejected) requests. It loads
 * the enriched requests for the counterparty, keeps a stable snapshot while the modal is open, and
 * derives each item's outcome (status, handled date, handler name) directly from the loaded data —
 * no mutations, delegation checks, or bulk actions.
 *
 * Each item corresponds to a single request, keyed by its request id, so a resource or package that
 * has been handled more than once shows up as one row per handled request.
 */
export const useHandledRequests = (request: Request | null, direction: HandledDirection) => {
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
  const [selectedResourceItem, setSelectedResourceItem] = useState<HandledResourceItem | null>(
    null,
  );
  const [selectedPackageItem, setSelectedPackageItem] = useState<HandledPackageItem | null>(null);

  // Reset when switching to a different party or direction (not on every object reference change)
  const requestPartyUuid = request?.partyUuid;
  useEffect(() => {
    setSnapshotRequests({ resourceRequests: [], packageRequests: [] });
    setSelectedResourceItem(null);
    setSelectedPackageItem(null);
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

  const handledResources = useMemo<HandledResourceItem[]>(() => {
    return snapshotRequests.resourceRequests
      .reduce<HandledResourceItem[]>((items, req) => {
        const status = toProcessedStatus(req.status);
        if (status) {
          items.push({
            requestId: req.id,
            resource: req.resource,
            outcome: { status, handledAt: req.lastUpdated, handledByName: req.lastUpdatedByName },
          });
        }
        return items;
      }, [])
      .sort(byHandledAtDesc);
  }, [snapshotRequests]);

  const handledPackages = useMemo<HandledPackageItem[]>(() => {
    return snapshotRequests.packageRequests
      .reduce<HandledPackageItem[]>((items, req) => {
        const status = toProcessedStatus(req.status);
        if (status) {
          items.push({
            requestId: req.id,
            package: req.package,
            outcome: { status, handledAt: req.lastUpdated, handledByName: req.lastUpdatedByName },
          });
        }
        return items;
      }, [])
      .sort(byHandledAtDesc);
  }, [snapshotRequests]);

  const handleSelection = ({
    resourceItem,
    packageItem,
  }: {
    resourceItem?: HandledResourceItem;
    packageItem?: HandledPackageItem;
  }) => {
    if (resourceItem) {
      setSelectedResourceItem(resourceItem);
      setSelectedPackageItem(null);
    } else if (packageItem) {
      setSelectedPackageItem(packageItem);
      setSelectedResourceItem(null);
    }
  };

  const resetSelection = () => {
    setSelectedResourceItem(null);
    setSelectedPackageItem(null);
  };

  return {
    isLoadingRequests,
    isFetchingRequests,
    handledResources,
    handledPackages,
    selectedResourceItem,
    selectedPackageItem,
    handleSelection,
    resetSelection,
  };
};

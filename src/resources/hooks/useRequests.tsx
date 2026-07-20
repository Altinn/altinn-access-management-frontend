import { useMemo } from 'react';
import { getCookie } from '../Cookie/CookieMethods';
import { PartyType, useGetIsAdminQuery, useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { hasConsentPermission, hasCreateSystemUserPermission } from '../utils/permissionUtils';
import { useGetActiveConsentsQuery } from '@/rtk/features/consentApi';
import { Request } from '@/features/amUI/requestPage/types';
import { useGetPendingSystemUserRequestsQuery } from '@/rtk/features/systemUserApi';
import { SystemUser } from '@/features/amUI/systemUser/types';
import { ActiveConsentListItem } from '@/features/amUI/consent/types';
import {
  RequestDto,
  useGetReceivedRequestsQuery,
  useGetSentRequestsQuery,
} from '@/rtk/features/requestApi';
import { formatDisplayName } from '@altinn/altinn-components';
import { isSubUnitByType } from '@/resources/utils/reporteeUtils';

interface UseRequestsOptions {
  skipSentRequests?: boolean;
}

export const useRequests = ({ skipSentRequests = false }: UseRequestsOptions = {}) => {
  const partyUuid = getCookie('AltinnPartyUuid');

  const {
    data: isAdmin,
    isLoading: isLoadingIsAdmin,
    isError: isAdminError,
  } = useGetIsAdminQuery();
  const {
    data: reportee,
    isLoading: isLoadingReportee,
    isError: isReporteeError,
  } = useGetReporteeQuery();

  const hasApproveConsentPermission = hasConsentPermission(isAdmin);
  const {
    data: activeConsents,
    isLoading: isLoadingActiveConsents,
    isError: isLoadingConsentsError,
  } = useGetActiveConsentsQuery(
    { partyId: partyUuid },
    { skip: !partyUuid || !hasApproveConsentPermission },
  );

  const hasSystemUserPermission = hasCreateSystemUserPermission(reportee, isAdmin);
  const {
    data: pendingSystemUsers,
    isLoading: isLoadingPendingSystemUsers,
    isError: isLoadingPendingSystemUsersError,
  } = useGetPendingSystemUserRequestsQuery(partyUuid, {
    skip: !partyUuid || !hasSystemUserPermission,
  });

  const {
    data: pendingSentAccessRequests,
    isLoading: isLoadingPendingSentAccessRequests,
    isError: isSentAccessRequestsError,
  } = useGetSentRequestsQuery(
    { party: partyUuid || '', status: ['Pending', 'Rejected', 'Approved'], to: '' },
    { skip: !partyUuid || skipSentRequests },
  );
  const {
    data: pendingReceivedAccessRequests,
    isLoading: isLoadingPendingReceivedAccessRequests,
    isError: isReceivedAccessRequestsError,
  } = useGetReceivedRequestsQuery(
    { party: partyUuid || '', status: ['Pending', 'Rejected', 'Approved'], from: '' },
    { skip: !partyUuid },
  );

  const sortRequests = (requests: Request[]): Request[] => {
    return [...requests].sort(
      (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(),
    );
  };

  const pendingRequests: {
    sent: Request[];
    handledSent: Request[];
    received: Request[];
    handledReceived: Request[];
  } = useMemo(() => {
    const consents = (activeConsents || [])
      .filter((x) => x.isPendingConsent)
      .map(mapConsentToRequest);

    const systemUserRequests = (pendingSystemUsers || []).map(mapSystemUserRequestToRequest);
    const sentAccessRequests = groupAccessRequests(pendingSentAccessRequests || [], 'sent', [
      'Pending',
    ]);
    const handledSentAccessRequests = groupAccessRequests(pendingSentAccessRequests || [], 'sent', [
      'Rejected',
      'Approved',
    ]);
    const receivedAccessRequests = groupAccessRequests(
      pendingReceivedAccessRequests || [],
      'received',
      ['Pending'],
    );
    const handledReceivedAccessRequests = groupAccessRequests(
      pendingReceivedAccessRequests || [],
      'received',
      ['Rejected', 'Approved'],
    );

    return {
      sent: sortRequests(sentAccessRequests),
      received: sortRequests([...consents, ...systemUserRequests, ...receivedAccessRequests]),
      handledSent: sortRequests(handledSentAccessRequests),
      handledReceived: sortRequests(handledReceivedAccessRequests),
    };
  }, [
    activeConsents,
    pendingSystemUsers,
    pendingSentAccessRequests,
    pendingReceivedAccessRequests,
  ]);

  return {
    pendingRequests,
    isReceivedRequestsError:
      isAdminError ||
      isReporteeError ||
      isLoadingConsentsError ||
      isLoadingPendingSystemUsersError ||
      isReceivedAccessRequestsError,
    isSentRequestsError: isAdminError || isReporteeError || isSentAccessRequestsError,
    isLoadingReceivedRequests:
      isLoadingIsAdmin ||
      isLoadingReportee ||
      isLoadingActiveConsents ||
      isLoadingPendingSystemUsers ||
      isLoadingPendingReceivedAccessRequests,
    isLoadingSentRequests:
      isLoadingIsAdmin || isLoadingReportee || isLoadingPendingSentAccessRequests,
  };
};

const mapConsentToRequest = (request: ActiveConsentListItem): Request => {
  return {
    id: request.id,
    type: 'consent',
    createdDate: request.createdDate,
    displayPartyName: request.toParty.name,
    displayPartyType: request.toParty.type === PartyType.Person ? 'person' : 'company',
    isSubUnit: request.toParty.type === PartyType.SubUnit,
    description: request.isPoa ? 'request_page.request_poa' : 'request_page.request_consent',
  };
};

const mapSystemUserRequestToRequest = (request: SystemUser): Request => {
  return {
    id: request.id,
    type: request.userType === 'agent' ? 'agentsystemuser' : 'systemuser',
    createdDate: request.created,
    displayPartyName: request.system.systemVendorOrgName,
    displayPartyType: 'system',
    description: 'request_page.request_systemuser',
  };
};

const groupAccessRequests = (
  requests: RequestDto[],
  direction: 'sent' | 'received',
  status: string[],
): Request[] => [
  ...requests
    .filter((request) => status.includes(request.status))
    .reduce((map, request) => {
      const key = direction === 'sent' ? request.to.id : request.from.id;
      const existing = map.get(key);
      if (existing) {
        const newerDate =
          new Date(request.lastUpdated) > new Date(existing.createdDate)
            ? request.lastUpdated
            : existing.createdDate;
        map.set(key, {
          ...existing,
          createdDate: newerDate,
          numberOfRequests: (existing.numberOfRequests ?? 1) + 1,
        });
      } else {
        map.set(key, mapAccessRequestToRequest(request, direction, 1));
      }
      return map;
    }, new Map<string, Request>())
    .values(),
];

const mapAccessRequestToRequest = (
  request: RequestDto,
  direction: 'sent' | 'received',
  numberOfRequests: number = 1,
): Request => {
  const party = direction === 'sent' ? request.to : request.from;
  const partyType = party.organizationIdentifier ? 'company' : 'person';
  const partyName = formatDisplayName({ fullName: party.name, type: partyType });
  return {
    id: request.id,
    type: 'accessrequest',
    createdDate: request.lastUpdated,
    displayPartyName: partyName,
    displayPartyType: partyType,
    partyUuid: party.id,
    isSubUnit: isSubUnitByType(party.variant),
    description: undefined, // Use default description for access requests
    numberOfRequests: numberOfRequests ?? 1,
  };
};

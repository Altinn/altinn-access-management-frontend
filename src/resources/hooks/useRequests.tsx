import { useMemo } from 'react';
import { getCookie } from '../Cookie/CookieMethods';
import { useGetIsAdminQuery, useGetReporteeQuery } from '@/rtk/features/userInfoApi';
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

export const useRequests = () => {
  const partyUuid = getCookie('AltinnPartyUuid');

  const {
    data: isAdmin,
    isLoading: isLoadingIsAdmin,
    isError: isAdminError,
  } = useGetIsAdminQuery();
  const {
    data: reportee,
    isLoading: isLoadingReportee,
    isLoading: isReporteeError,
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

  const { data: pendingSentAccessRequests } = useGetSentRequestsQuery(
    { party: partyUuid || '', status: ['Pending'], to: '' },
    { skip: !partyUuid },
  );
  const { data: pendingReceivedAccessRequests } = useGetReceivedRequestsQuery(
    { party: partyUuid || '', status: ['Pending'], from: '' },
    { skip: !partyUuid },
  );

  const pendingRequests: { sent: Request[]; received: Request[] } = useMemo(() => {
    const consents = (activeConsents || [])
      .filter((x) => x.isPendingConsent)
      .map(mapConsentToRequest);

    const systemUserRequests = (pendingSystemUsers || []).map(mapSystemUserRequestToRequest);
    const sentAccessRequests = groupAccessRequests(pendingSentAccessRequests || [], 'sent');
    const receivedAccessRequests = groupAccessRequests(
      pendingReceivedAccessRequests || [],
      'received',
    );

    return {
      sent: [...sentAccessRequests].sort(
        (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(),
      ),
      received: [...consents, ...systemUserRequests, ...receivedAccessRequests].sort(
        (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(),
      ),
    };
  }, [
    activeConsents,
    pendingSystemUsers,
    pendingSentAccessRequests,
    pendingReceivedAccessRequests,
  ]);

  return {
    pendingRequests,
    isError:
      isAdminError || isReporteeError || isLoadingConsentsError || isLoadingPendingSystemUsersError,
    isLoadingRequests:
      isLoadingIsAdmin ||
      isLoadingReportee ||
      isLoadingActiveConsents ||
      isLoadingPendingSystemUsers,
  };
};

const mapConsentToRequest = (request: ActiveConsentListItem): Request => {
  return {
    id: request.id,
    type: 'consent',
    createdDate: request.createdDate,
    displayPartyName: request.toParty.name,
    displayPartyType: request.toParty.type === 'Person' ? 'person' : 'company',
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

const groupAccessRequests = (requests: RequestDto[], direction: 'sent' | 'received'): Request[] => [
  ...requests
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
    description: undefined, // Use default description for access requests
    numberOfRequests: numberOfRequests ?? 1,
  };
};

import React, { useMemo } from 'react';
import { getCookie } from '../Cookie/CookieMethods';
import { useGetIsAdminQuery, useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { hasConsentPermission, hasCreateSystemUserPermission } from '../utils/permissionUtils';
import { useGetActiveConsentsQuery } from '@/rtk/features/consentApi';
import { Request } from '@/features/amUI/requestPage/types';
import { useGetPendingSystemUserRequestsQuery } from '@/rtk/features/systemUserApi';
import { SystemUser } from '@/features/amUI/systemUser/types';
import { ActiveConsentListItem } from '@/features/amUI/consent/types';

export const useRequests = () => {
  const partyUuid = getCookie('AltinnPartyUuid');

  const {
    data: isAdmin,
    isLoading: isLoadingIsAdmin,
    isError: isAdminError,
  } = useGetIsAdminQuery();
  const { data: reportee, isLoading: isLoadingReportee } = useGetReporteeQuery();

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

  const pendingRequests: Request[] = useMemo(() => {
    const consents = (activeConsents || [])
      .filter((x) => x.isPendingConsent)
      .map(mapConsentToRequest);

    const systemUserRequests = (pendingSystemUsers || []).map(mapSystemUserRequestToRequest);
    return [...consents, ...systemUserRequests].sort(
      (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(),
    );
  }, [activeConsents, pendingSystemUsers]);

  return {
    pendingRequests,
    isError: isAdminError || isLoadingConsentsError || isLoadingPendingSystemUsersError,
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
    fromPartyName: request.toParty.name,
    fromPartyType: request.toParty.type === 'Person' ? 'person' : 'company',
    description: request.isPoa ? 'request_page.request_poa' : 'request_page.request_consent',
  };
};

const mapSystemUserRequestToRequest = (request: SystemUser): Request => {
  return {
    id: request.id,
    type: request.userType === 'agent' ? 'agentsystemuser' : 'systemuser',
    createdDate: request.created,
    fromPartyName: request.system.systemVendorOrgName,
    fromPartyType: 'system',
    description: 'request_page.request_systemuser',
  };
};

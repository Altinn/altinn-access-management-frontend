import { getCookie } from '../Cookie/CookieMethods';
import { hasConsentPermission, hasCreateSystemUserPermission } from '../utils/permissionUtils';

import { useGetConsentRequestsCountQuery } from '@/rtk/features/consentApi';
import { useGetReceivedRequestsCountQuery } from '@/rtk/features/requestApi';
import { useGetPendingSystemUserRequestsQuery } from '@/rtk/features/systemUserApi';
import type { ReporteeInfo } from '@/rtk/features/userInfoApi';

interface UseSidebarRequestCountParams {
  isAdmin?: boolean;
  reportee?: ReporteeInfo;
  isCurrentUserReportee?: boolean;
  isLoadingPermissions: boolean;
}

export const useSidebarRequestCount = ({
  isAdmin,
  reportee,
  isCurrentUserReportee,
  isLoadingPermissions,
}: UseSidebarRequestCountParams) => {
  const partyUuid = getCookie('AltinnPartyUuid');

  const shouldFetchReceivedRequestsCount = !!partyUuid && !!isAdmin;
  const shouldFetchConsents =
    !!partyUuid && hasConsentPermission(reportee, isAdmin, isCurrentUserReportee);
  const shouldFetchSystemUsers = !!partyUuid && !!hasCreateSystemUserPermission(reportee, isAdmin);

  const {
    data: receivedRequestsCount,
    isLoading: isLoadingReceivedRequestsCount,
    isError: isErrorReceivedRequestsCount,
  } = useGetReceivedRequestsCountQuery(
    { party: partyUuid ?? '', status: ['Pending'] },
    { skip: !shouldFetchReceivedRequestsCount },
  );

  const {
    data: pendingConsentsCount,
    isLoading: isLoadingPendingConsents,
    isError: isErrorPendingConsents,
  } = useGetConsentRequestsCountQuery({ partyId: partyUuid ?? '' }, { skip: !shouldFetchConsents });

  const {
    data: pendingSystemUsers,
    isLoading: isLoadingPendingSystemUsers,
    isError: isErrorPendingSystemUsers,
  } = useGetPendingSystemUserRequestsQuery(partyUuid ?? '', {
    skip: !shouldFetchSystemUsers,
  });

  const pendingSystemUserCount = (pendingSystemUsers ?? []).length;

  return {
    requestsBadgeCount:
      (receivedRequestsCount ?? 0) + (pendingConsentsCount ?? 0) + pendingSystemUserCount,
    isLoading:
      isLoadingPermissions ||
      isLoadingReceivedRequestsCount ||
      isLoadingPendingConsents ||
      isLoadingPendingSystemUsers,
    isError: isErrorReceivedRequestsCount || isErrorPendingConsents || isErrorPendingSystemUsers,
  };
};

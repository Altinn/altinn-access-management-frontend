import { getCookie } from '../Cookie/CookieMethods';
import { useGetConsentRequestsCountQuery } from '@/rtk/features/consentApi';
import { useGetReceivedRequestsCountQuery } from '@/rtk/features/requestApi';
import { useGetPendingSystemUserRequestsQuery } from '@/rtk/features/systemUserApi';
import type { ReporteeInfo } from '@/rtk/features/userInfoApi';
import { enableRequestSingleRight } from '../utils/featureFlagUtils';
import { hasConsentPermission, hasCreateSystemUserPermission } from '../utils/permissionUtils';

interface UseSidebarRequestCountParams {
  displayRequestsPage: boolean;
  isAdmin?: boolean;
  reportee?: ReporteeInfo;
  isLoadingPermissions: boolean;
}

export const useSidebarRequestCount = ({
  displayRequestsPage,
  isAdmin,
  reportee,
  isLoadingPermissions,
}: UseSidebarRequestCountParams) => {
  const partyUuid = getCookie('AltinnPartyUuid');

  const shouldFetchReceivedRequestsCount =
    displayRequestsPage && !!partyUuid && enableRequestSingleRight() && !!isAdmin;
  const shouldFetchConsents = displayRequestsPage && !!partyUuid && hasConsentPermission(isAdmin);
  const shouldFetchSystemUsers =
    displayRequestsPage && !!partyUuid && !!hasCreateSystemUserPermission(reportee, isAdmin);

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

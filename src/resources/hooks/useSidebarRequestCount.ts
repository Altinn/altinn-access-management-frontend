import { getCookie } from '../Cookie/CookieMethods';
import { useGetActiveConsentsQuery } from '@/rtk/features/consentApi';
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
    data: activeConsents,
    isLoading: isLoadingActiveConsents,
    isError: isErrorActiveConsents,
  } = useGetActiveConsentsQuery({ partyId: partyUuid ?? '' }, { skip: !shouldFetchConsents });

  const {
    data: pendingSystemUsers,
    isLoading: isLoadingPendingSystemUsers,
    isError: isErrorPendingSystemUsers,
  } = useGetPendingSystemUserRequestsQuery(partyUuid ?? '', {
    skip: !shouldFetchSystemUsers,
  });

  const pendingConsentCount = (activeConsents ?? []).filter(
    (consent) => consent.isPendingConsent,
  ).length;
  const pendingSystemUserCount = (pendingSystemUsers ?? []).length;

  return {
    requestsBadgeCount: (receivedRequestsCount ?? 0) + pendingConsentCount + pendingSystemUserCount,
    isLoading:
      isLoadingPermissions ||
      isLoadingReceivedRequestsCount ||
      isLoadingActiveConsents ||
      isLoadingPendingSystemUsers,
    isError: isErrorReceivedRequestsCount || isErrorActiveConsents || isErrorPendingSystemUsers,
  };
};

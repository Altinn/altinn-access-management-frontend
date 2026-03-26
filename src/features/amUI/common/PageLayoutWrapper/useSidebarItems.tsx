import { getCookie } from '@/resources/Cookie/CookieMethods';
import { clientAdministrationPageEnabled } from '@/resources/utils/featureFlagUtils';
import {
  hasConsentPermission,
  hasCreateSystemUserPermission,
  hasSystemUserClientAdminPermission,
} from '@/resources/utils/permissionUtils';
import {
  getConsentMenuItem,
  getHeadingMenuItem,
  getClientAdministrationMenuItem,
  getPoaOverviewMenuItem,
  getReporteesMenuItem,
  getRequestsMenuItem,
  getSettingsMenuItem,
  getShortcutsMenuItem,
  getSystemUserMenuItem,
  getUsersMenuItem,
  getYourClientsMenuItem,
} from '@/resources/utils/sidebarConfig';
import { useGetPartyFromLoggedInUserQuery } from '@/rtk/features/lookupApi';
import {
  useGetIsAdminQuery,
  useGetIsClientAdminQuery,
  useGetIsCompanyProfileAdminQuery,
  useGetReporteeQuery,
} from '@/rtk/features/userInfoApi';
import { BadgeVariant, Color, MenuItemProps } from '@altinn/altinn-components';
import { useLocation } from 'react-router';
import { useGetRolePermissionsQuery } from '@/rtk/features/roleApi';
import { useRequests } from '@/resources/hooks/useRequests';

export const useSidebarItems = ({ isSmall }: { isSmall?: boolean }) => {
  const displayConfettiPackage = window.featureFlags?.displayConfettiPackage;

  const displaySettingsPage = window.featureFlags?.displaySettingsPage;
  const displayPoaOverviewPage = window.featureFlags?.displayPoaOverviewPage;
  const displayRequestsPage = window.featureFlags?.displayRequestsPage;

  const displayClientAdministrationPage = clientAdministrationPageEnabled();
  const { data: currentUser } = useGetPartyFromLoggedInUserQuery();
  const { data: reportee, isLoading: isLoadingReportee } = useGetReporteeQuery();
  const isCurrentUserReportee = reportee?.partyUuid === currentUser?.partyUuid;

  const { data: roles } = useGetRolePermissionsQuery(
    {
      party: currentUser?.partyUuid ?? '',
      from: getCookie('AltinnPartyUuid') ?? '',
      to: currentUser?.partyUuid ?? '',
    },
    {
      skip: !displayClientAdministrationPage || !currentUser?.partyUuid || isCurrentUserReportee,
    },
  );
  const isAgent = roles?.some((rolePermission) => rolePermission.role.code === 'agent');

  const { pathname } = useLocation();

  const { data: isAdmin, isLoading: isLoadingIsAdmin } = useGetIsAdminQuery();
  const { data: isClientAdmin, isLoading: isLoadingIsClientAdmin } = useGetIsClientAdminQuery();
  const { data: canAccessSettings, isLoading: isLoadingCompanyProfileAdmin } =
    useGetIsCompanyProfileAdminQuery();

  const { pendingRequests, isLoadingRequests } = useRequests();
  const receivedRequestsCount = pendingRequests ? pendingRequests.received.length : 0;

  const isLoading =
    isLoadingReportee || isLoadingIsAdmin || isLoadingIsClientAdmin || isLoadingCompanyProfileAdmin;

  const items: MenuItemProps[] = [];

  if (!isSmall) {
    items.push(getHeadingMenuItem(pathname, isLoading));
  }
  if (displayRequestsPage && isAdmin) {
    const requestsBadge =
      !isLoadingRequests && receivedRequestsCount > 0
        ? {
            label: receivedRequestsCount,
            color: 'warning' as Color,
            variant: 'base' as BadgeVariant,
          }
        : undefined;
    items.push({
      ...getRequestsMenuItem(pathname, isLoading, isSmall),
      badge: requestsBadge,
    });
  }

  if (displayConfettiPackage) {
    items.push(getUsersMenuItem(pathname, isLoading, isSmall));
    if (isAdmin) {
      items.push(getReporteesMenuItem(pathname, isLoading, isSmall));
    }
  }

  if (displayPoaOverviewPage && isAdmin) {
    items.push(getPoaOverviewMenuItem(pathname, isLoading, isSmall));
  }

  if (hasConsentPermission(isAdmin)) {
    items.push(getConsentMenuItem(pathname, isLoading, isSmall));
  }

  if (
    hasCreateSystemUserPermission(reportee, isAdmin) ||
    hasSystemUserClientAdminPermission(reportee, isClientAdmin)
  ) {
    items.push(getSystemUserMenuItem(pathname, isLoading, isSmall));
  }

  if (isClientAdmin && displayClientAdministrationPage) {
    items.push(getClientAdministrationMenuItem(pathname, isLoading, isSmall));
  }

  if (isAgent && !isCurrentUserReportee && displayClientAdministrationPage) {
    items.push({
      ...getYourClientsMenuItem(pathname, isLoading, isSmall),
    });
  }

  if (canAccessSettings && displaySettingsPage) {
    items.push(getSettingsMenuItem(pathname, isLoading, isSmall));
  }

  if (displayConfettiPackage) {
    items.push(...getShortcutsMenuItem(pathname, isLoading));
  }

  const sidebarItems = items.map((item) => {
    return { ...item, description: '' };
  });

  return { sidebarItems };
};

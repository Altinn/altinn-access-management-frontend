import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useRequests } from '@/resources/hooks/useRequests';
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
import { useGetMyClientsQuery } from '@/rtk/features/clientApi';
import { useGetPartyFromLoggedInUserQuery } from '@/rtk/features/lookupApi';
import {
  useGetIsAdminQuery,
  useGetIsClientAdminQuery,
  useGetIsCompanyProfileAdminQuery,
  useGetReporteeQuery,
} from '@/rtk/features/userInfoApi';
import { BadgeVariant, Color, MenuItemProps } from '@altinn/altinn-components';
import { useLocation } from 'react-router';

export const useSidebarItems = ({ isSmall }: { isSmall?: boolean }) => {
  const displayConfettiPackage = window.featureFlags?.displayConfettiPackage;

  const displaySettingsPage = window.featureFlags?.displaySettingsPage;
  const displayPoaOverviewPage = window.featureFlags?.displayPoaOverviewPage;
  const displayRequestsPage = window.featureFlags?.displayRequestsPage;
  const displayClientAdministrationPage = window.featureFlags?.displayClientAdministrationPage;
  const { data: currentUser } = useGetPartyFromLoggedInUserQuery();
  const { data: reportee, isLoading: isLoadingReportee } = useGetReporteeQuery();
  const isCurrentUserReportee = reportee?.partyUuid === currentUser?.partyUuid;

  const actingPartyUuid = getCookie('AltinnPartyUuid') ?? '';

  const { data: myClientsByProvider } = useGetMyClientsQuery(
    { provider: [actingPartyUuid] },
    {
      skip:
        !actingPartyUuid ||
        !reportee?.partyUuid ||
        !currentUser?.partyUuid ||
        isCurrentUserReportee,
    },
  );

  const hasMyClients = myClientsByProvider && myClientsByProvider.length > 0;

  const { pathname } = useLocation();

  const { data: isAdmin, isLoading: isLoadingIsAdmin } = useGetIsAdminQuery();
  const { data: isClientAdmin, isLoading: isLoadingIsClientAdmin } = useGetIsClientAdminQuery();
  const { data: canAccessSettings, isLoading: isLoadingCompanyProfileAdmin } =
    useGetIsCompanyProfileAdminQuery();
  const { pendingRequests } = useRequests();

  const isLoading =
    isLoadingReportee || isLoadingIsAdmin || isLoadingIsClientAdmin || isLoadingCompanyProfileAdmin;

  const items: MenuItemProps[] = [];

  if (!isSmall) {
    items.push(getHeadingMenuItem(pathname, isLoading));
  }
  if (displayRequestsPage) {
    const requestsBadge =
      pendingRequests && pendingRequests.length > 0
        ? {
            label: pendingRequests.length,
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

  if (hasMyClients && !isCurrentUserReportee && displayClientAdministrationPage) {
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

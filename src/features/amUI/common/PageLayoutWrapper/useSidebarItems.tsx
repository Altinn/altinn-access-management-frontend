import {
  hasConsentPermission,
  hasCreateSystemUserPermission,
  hasSystemUserClientAdminPermission,
} from '@/resources/utils/permissionUtils';
import {
  getConsentMenuItem,
  getHeadingMenuItem,
  getPoaOverviewMenuItem,
  getReporteesMenuItem,
  getRequestsMenuItem,
  getSettingsMenuItem,
  getShortcutsMenuItem,
  getSystemUserMenuItem,
  getUsersMenuItem,
} from '@/resources/utils/sidebarConfig';
import {
  useGetIsAdminQuery,
  useGetIsClientAdminQuery,
  useGetIsCompanyProfileAdminQuery,
  useGetReporteeQuery,
} from '@/rtk/features/userInfoApi';
import { MenuItemProps } from '@altinn/altinn-components';
import { useLocation } from 'react-router';

export const useSidebarItems = ({ isSmall }: { isSmall?: boolean }) => {
  const displayConfettiPackage = window.featureFlags?.displayConfettiPackage;

  const displaySettingsPage = window.featureFlags?.displaySettingsPage;
  const displayPoaOverviewPage = window.featureFlags?.displayPoaOverviewPage;
  const displayRequestsPage = window.featureFlags?.displayRequestsPage;

  const { data: reportee, isLoading: isLoadingReportee } = useGetReporteeQuery();
  const { pathname } = useLocation();

  const { data: isAdmin, isLoading: isLoadingIsAdmin } = useGetIsAdminQuery();
  const { data: isClientAdmin, isLoading: isLoadingIsClientAdmin } = useGetIsClientAdminQuery();
  const { data: canAccessSettings, isLoading: isLoadingCompanyProfileAdmin } =
    useGetIsCompanyProfileAdminQuery();

  const isLoading =
    isLoadingReportee || isLoadingIsAdmin || isLoadingIsClientAdmin || isLoadingCompanyProfileAdmin;

  const items: MenuItemProps[] = [];

  if (!isSmall) {
    items.push(getHeadingMenuItem(pathname, isLoading));
  }
  if (displayRequestsPage) {
    items.push(getRequestsMenuItem(pathname, isLoading, isSmall));
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

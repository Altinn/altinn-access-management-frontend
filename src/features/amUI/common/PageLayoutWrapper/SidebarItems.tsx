import React from 'react';
import { type MenuItemProps } from '@altinn/altinn-components';
import { ReporteeInfo } from '@/rtk/features/userInfoApi';
import {
  hasConsentPermission,
  hasSystemUserClientAdminPermission,
  hasCreateSystemUserPermission,
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
/**
 * Generates a list of sidebar items for the page layout.
 *
 * @returns {MenuItemProps[], } A list of sidebar items, including a heading,
 *                            and optionally a confetti package if the feature flag is enabled.
 */
export const SidebarItems = (
  isSmall: boolean = false,
  isLoading: boolean = false,
  pathname: string = '',
  isAdmin: boolean | undefined,
  isClientAdmin: boolean | undefined,
  reportee: ReporteeInfo | undefined,
  canAccessSettings: boolean = false,
) => {
  const displayConfettiPackage = window.featureFlags?.displayConfettiPackage;
  const displayConsentGui = window.featureFlags?.displayConsentGui;

  const displaySettingsPage = window.featureFlags?.displaySettingsPage;
  const displayPoaOverviewPage = window.featureFlags?.displayPoaOverviewPage;
  const displayRequestsPage = window.featureFlags?.displayRequestsPage;

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

  if (displayConsentGui && hasConsentPermission(reportee, isAdmin)) {
    items.push(getConsentMenuItem(pathname, isLoading, isSmall));
  }

  if (
    hasCreateSystemUserPermission(reportee) ||
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

  return items.map((item) => {
    return { ...item, description: '' };
  });
};

import React from 'react';
import {
  formatDisplayName,
  type MenuItemProps,
  type MenuItemSize,
} from '@altinn/altinn-components';
import {
  PersonGroupIcon,
  TenancyIcon,
  PadlockUnlockedIcon,
  HandshakeIcon,
  InformationSquareIcon,
  LeaveIcon,
  LinkIcon,
  CogIcon,
} from '@navikt/aksel-icons';
import { t } from 'i18next';
import { Link } from 'react-router';

import { amUIPath, ConsentPath, SystemUserPath } from '@/routes/paths';
import { getHostUrl } from '@/resources/utils/pathUtils';
import { ReporteeInfo } from '@/rtk/features/userInfoApi';
import {
  hasConsentPermission,
  hasCreateSystemUserPermission,
} from '@/resources/utils/permissionUtils';

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
  pendingSystemUsersCount: number,
  canAccessSettings: boolean = false,
) => {
  const displayConfettiPackage = window.featureFlags?.displayConfettiPackage;
  const displayConsentGui = window.featureFlags?.displayConsentGui;

  const displaySettingsPage = window.featureFlags?.displaySettingsPage;
  const displayPoaOverviewPage = window.featureFlags?.displayPoaOverviewPage;

  const heading: MenuItemProps = {
    id: '1',
    groupId: 1,
    icon: {
      name: formatDisplayName({
        fullName: reportee?.name || '',
        type: reportee?.type === 'Person' ? 'person' : 'company',
      }),
      type: reportee?.type === 'Person' ? 'person' : 'company',
    },
    size: 'lg',
    loading: isLoading,
    title: t('sidebar.access_management'),
    interactive: false,
  };

  const users: MenuItemProps = {
    groupId: 2,
    id: '2',
    size: 'md' as MenuItemSize,
    loading: isLoading,
    title: t('sidebar.users'),
    selected: pathname?.includes(`/${amUIPath.Users}`),
    icon: PersonGroupIcon,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    as: (props: any) => (
      <Link
        to={`/${amUIPath.Users}`}
        {...props}
      />
    ),
  };

  const poaOverview: MenuItemProps = {
    groupId: 2,
    id: '2.1',
    size: 'md',
    loading: isLoading,
    title: t('sidebar.poa_overview'),
    icon: PadlockUnlockedIcon,
    selected: pathname?.includes(`/${amUIPath.PoaOverview}`),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    as: (props: any) => (
      <Link
        to={`/${amUIPath.PoaOverview}`}
        {...props}
      />
    ),
  };

  const reportees: MenuItemProps = {
    groupId: 4,
    id: '4',
    size: 'md' as MenuItemSize,
    loading: isLoading,
    title: t('sidebar.reportees'),
    selected: pathname?.includes(`/${amUIPath.Reportees}`),
    icon: LinkIcon,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    as: (props: any) => (
      <Link
        to={`/${amUIPath.Reportees}`}
        {...props}
      />
    ),
  };

  const consent: MenuItemProps = {
    groupId: 5,
    id: '5',
    size: 'md',
    loading: isLoading,
    title: t('sidebar.consent'),
    icon: HandshakeIcon,
    selected: pathname?.includes(`/${ConsentPath.Consent}/`),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    as: (props: any) => (
      <Link
        to={`/${ConsentPath.Consent}/${ConsentPath.Active}`}
        {...props}
      />
    ),
  };

  const systemUser: MenuItemProps = {
    groupId: 6,
    id: '6',
    size: 'md',
    loading: isLoading,
    title: t('sidebar.systemaccess'),
    icon: TenancyIcon,
    badge:
      pendingSystemUsersCount > 0
        ? {
            label: pendingSystemUsersCount.toString(),
            color: 'danger',
            variant: 'base',
          }
        : undefined,
    selected: pathname?.includes(`/${SystemUserPath.SystemUser}/`),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    as: (props: any) => (
      <Link
        to={`/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`}
        {...props}
      />
    ),
  };

  const settings: MenuItemProps = {
    groupId: 'settings-group',
    id: 'settings',
    size: 'md' as MenuItemSize,
    loading: isLoading,
    title: t('sidebar.settings'),
    selected: pathname?.includes(`/${amUIPath.Settings}`),
    icon: CogIcon,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    as: (props: any) => (
      <Link
        to={`/${amUIPath.Settings}`}
        {...props}
      />
    ),
  };

  const shortcuts: MenuItemProps[] = [
    {
      groupId: 'shortcuts',
      id: 'beta-about',
      size: 'md',
      loading: isLoading,
      title: t('header.new_altinn_info'),
      icon: InformationSquareIcon,
      selected: pathname?.includes(`/${amUIPath.Info}`),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      as: (props: any) => (
        <Link
          to={`/${amUIPath.Info}`}
          {...props}
        />
      ),
    },
    {
      groupId: 'shortcuts',
      id: 'beta-leave',
      size: 'md',
      loading: isLoading,
      title: t('header.leave_beta'),
      icon: LeaveIcon,
      selected: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      as: (props: any) => (
        <Link
          to={getHostUrl() + 'ui/profile'}
          {...props}
        />
      ),
    },
  ];

  const items: MenuItemProps[] = [];

  if (!isSmall) {
    items.push(heading);
  }

  if (reportee?.type === 'Person' && displayConsentGui) {
    return [...items, consent, ...shortcuts];
  }

  if (displayConfettiPackage) {
    items.push(users);
    if (isAdmin) {
      items.push(reportees);
    }
  }

  if (displayPoaOverviewPage && isAdmin) {
    items.push(poaOverview);
  }

  if (displayConsentGui && hasConsentPermission(reportee, isAdmin)) {
    items.push(consent);
  }

  if (hasCreateSystemUserPermission(reportee) || isClientAdmin) {
    items.push(systemUser);
  }

  if (canAccessSettings && displaySettingsPage) {
    items.push(settings);
  }

  if (displayConfettiPackage && !isSmall) {
    items.push(...shortcuts);
  }

  return items;
};

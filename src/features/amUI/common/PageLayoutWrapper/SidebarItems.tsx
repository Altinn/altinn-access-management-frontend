import React from 'react';
import type { MenuItemProps, MenuItemSize } from '@altinn/altinn-components';
import {
  PersonGroupIcon,
  TenancyIcon,
  PadlockUnlockedIcon,
  HandshakeIcon,
  InformationSquareIcon,
  LeaveIcon,
  LinkIcon,
} from '@navikt/aksel-icons';
import { t } from 'i18next';
import { Link } from 'react-router';

import { amUIPath, ConsentPath, SystemUserPath } from '@/routes/paths';
import { getHostUrl } from '@/resources/utils/pathUtils';

/**
 * Generates a list of sidebar items for the page layout.
 *
 * @returns {MenuItemProps[], } A list of sidebar items, including a heading,
 *                            and optionally a confetti package if the feature flag is enabled.
 */
export const SidebarItems = (
  isSmall: boolean = false,
  pathname: string = '',
  isAdmin: boolean | undefined,
  accountName: string,
  accountType: 'company' | 'person',
) => {
  const displayConfettiPackage = window.featureFlags?.displayConfettiPackage;
  const displayLimitedPreviewLaunch = window.featureFlags?.displayLimitedPreviewLaunch;
  const isLoading = !accountName;

  const heading: MenuItemProps = {
    id: '1',
    groupId: 1,
    icon: {
      name: accountName,
      type: accountType,
    },
    size: 'lg',
    loading: isLoading,
    title: t('sidebar.access_management'),
    badge: { label: t('common.beta') },
    interactive: false,
  };

  const users: MenuItemProps = {
    groupId: 2,
    id: '2',
    size: 'md' as MenuItemSize,
    title: t('sidebar.users'),
    loading: isLoading,
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
    title: t('sidebar.poa_overview'),
    loading: isLoading,
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
    title: t('sidebar.reportees'),
    loading: isLoading,
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
    title: t('sidebar.consent'),
    loading: isLoading,
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
    title: t('sidebar.systemaccess'),
    loading: isLoading,
    icon: TenancyIcon,
    selected: pathname?.includes(`/${SystemUserPath.SystemUser}/`),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    as: (props: any) => (
      <Link
        to={`/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`}
        {...props}
      />
    ),
  };

  const shortcuts: MenuItemProps[] = [
    {
      groupId: 'shortcuts',
      id: 'beta-about',
      size: 'md',
      title: t('header.new_altinn_info'),
      loading: isLoading,
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
      title: t('header.leave_beta'),
      loading: isLoading,
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

  if (accountType === 'person') {
    return [...items, consent, ...shortcuts];
  }

  if (displayConfettiPackage) {
    items.push(users);
    if (isAdmin) {
      items.push(reportees);
    }
  }

  if (!displayLimitedPreviewLaunch) {
    if (isAdmin) {
      items.push(poaOverview);
    }
  }

  items.push(consent, systemUser);

  if (displayConfettiPackage && !isSmall) {
    shortcuts.map((shortcutItem) => items.push(shortcutItem));
  }

  return items;
};

import React from 'react';
import type { MenuItemProps, MenuItemSize } from '@altinn/altinn-components';
import {
  InboxIcon,
  PersonGroupIcon,
  TenancyIcon,
  PadlockUnlockedIcon,
  HandshakeIcon,
} from '@navikt/aksel-icons';
import { t } from 'i18next';
import { Link } from 'react-router';

import { amUIPath, ConsentPath, SystemUserPath } from '@/routes/paths';

/**
 * Generates a list of sidebar items for the page layout.
 *
 * @returns {MenuItemProps[]} A list of sidebar items, including a heading,
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

  const heading: MenuItemProps = {
    id: '1',
    groupId: 1,
    icon: {
      name: accountName,
      type: accountType,
    },
    size: 'lg',
    title: t('sidebar.access_management'),
  };

  const users: MenuItemProps = {
    groupId: 2,
    id: '2',
    size: 'md' as MenuItemSize,
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
    title: t('sidebar.reportees'),
    selected: pathname?.includes(`/${amUIPath.Reportees}`),
    icon: InboxIcon,
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

  const items: MenuItemProps[] = [];

  if (!isSmall) {
    items.push(heading);
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

  return items;
};

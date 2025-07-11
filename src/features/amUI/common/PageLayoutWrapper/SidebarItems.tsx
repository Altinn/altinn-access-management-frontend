import React from 'react';
import type { MenuItemProps, MenuItemSize } from '@altinn/altinn-components';
import { InboxIcon, PersonGroupIcon, TenancyIcon } from '@navikt/aksel-icons';
import { t } from 'i18next';
import { Link } from 'react-router';

import { amUIPath, SystemUserPath } from '@/routes/paths';

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
  const heading: MenuItemProps = {
    id: '1',
    groupId: 1,
    avatar: {
      name: accountName,
      type: accountType,
    },
    size: 'lg',
    title: t('sidebar.access_management'),
  };

  const confettiPackage: MenuItemProps[] = [
    {
      groupId: 2,
      id: '2',
      size: 'md' as MenuItemSize,
      title: t('sidebar.users'),
      selected: pathname?.includes(`/${amUIPath.Users}`),
      icon: PersonGroupIcon,
      as: (props) => (
        <Link
          to={`/${amUIPath.Users}`}
          {...props}
        />
      ),
    },
    {
      groupId: 3,
      id: '3',
      size: 'md' as MenuItemSize,
      title: t('sidebar.reportees'),
      selected: pathname?.includes(`/${amUIPath.Reportees}`),
      icon: InboxIcon,
      as: (props) => (
        <Link
          to={`/${amUIPath.Reportees}`}
          {...props}
        />
      ),
    },
  ].slice(0, isAdmin ? 2 : 1);

  const systemUserPath = `/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`;
  const systemUser: MenuItemProps = {
    groupId: 4,
    id: '4',
    size: 'md',
    title: t('sidebar.systemaccess'),
    icon: TenancyIcon,
    selected: pathname?.includes(systemUserPath),
    as: (props) => (
      <Link
        to={systemUserPath}
        {...props}
      />
    ),
  };

  if (displayConfettiPackage) {
    if (isSmall) {
      return [...confettiPackage, systemUser];
    }
    return [heading, ...confettiPackage, systemUser];
  }
  if (isSmall) {
    return [systemUser];
  }
  return [heading, systemUser];
};

import React, { ComponentProps, JSX } from 'react';
import { type MenuItemProps } from '@altinn/altinn-components';
import {
  PersonGroupIcon,
  TenancyIcon,
  PadlockUnlockedIcon,
  HandshakeIcon,
  InformationSquareIcon,
  LeaveIcon,
  CogIcon,
  BellDotIcon,
  PadlockLockedFillIcon,
  KeyVerticalIcon,
} from '@navikt/aksel-icons';
import { t } from 'i18next';
import { Link } from 'react-router';

import { amUIPath, ConsentPath, SystemUserPath } from '@/routes/paths';
import { getHostUrl } from '@/resources/utils/pathUtils';

const getMenuLinkAs = (props: ComponentProps<typeof Link>, toUrl: string): JSX.Element => {
  return (
    <Link
      {...props}
      to={toUrl}
    />
  );
};

export const getHeadingMenuItem = (pathname?: string, isLoading = false): MenuItemProps => {
  return {
    id: '1',
    groupId: 1,
    icon: { svgElement: PadlockLockedFillIcon, theme: 'base' },
    size: 'lg',
    loading: isLoading,
    title: t('sidebar.access_management'),
    selected: pathname === '/',
    as: (props) => getMenuLinkAs(props, '/'),
  };
};

export const getUsersMenuItem = (pathname?: string, isLoading = false): MenuItemProps => {
  return {
    groupId: 2,
    id: '2',
    size: 'md',
    loading: isLoading,
    title: t('sidebar.users'),
    selected: pathname?.includes(`/${amUIPath.Users}`),
    icon: { svgElement: PersonGroupIcon, theme: 'default' },
    as: (props) => getMenuLinkAs(props, `/${amUIPath.Users}`),
  };
};

export const getPoaOverviewMenuItem = (pathname?: string, isLoading = false): MenuItemProps => {
  return {
    groupId: 2,
    id: '2.1',
    size: 'md',
    loading: isLoading,
    title: t('sidebar.poa_overview'),
    icon: { svgElement: KeyVerticalIcon, theme: 'default' },
    selected: pathname?.includes(`/${amUIPath.PoaOverview}`),
    as: (props) => getMenuLinkAs(props, `/${amUIPath.PoaOverview}`),
  };
};

export const getReporteesMenuItem = (pathname?: string, isLoading = false): MenuItemProps => {
  return {
    groupId: 4,
    id: '4',
    size: 'md',
    loading: isLoading,
    title: t('sidebar.reportees'),
    selected: pathname?.includes(`/${amUIPath.Reportees}`),
    icon: { svgElement: PadlockUnlockedIcon, theme: 'default' },
    as: (props) => getMenuLinkAs(props, `/${amUIPath.Reportees}`),
  };
};

export const getConsentMenuItem = (pathname?: string, isLoading = false): MenuItemProps => {
  return {
    groupId: 4,
    id: '4.1',
    size: 'md',
    loading: isLoading,
    title: t('sidebar.consent'),
    icon: { svgElement: HandshakeIcon, theme: 'default' },
    selected: pathname?.includes(`/${ConsentPath.Consent}`),
    as: (props) => getMenuLinkAs(props, `/${ConsentPath.Consent}/${ConsentPath.Active}`),
  };
};

export const getSystemUserMenuItem = (pathname?: string, isLoading = false): MenuItemProps => {
  return {
    groupId: 6,
    id: '6',
    size: 'md',
    loading: isLoading,
    title: t('sidebar.systemaccess'),
    icon: { svgElement: TenancyIcon, theme: 'default' },
    selected: pathname?.includes(`/${SystemUserPath.SystemUser}`),
    as: (props) => getMenuLinkAs(props, `/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`),
  };
};

export const getSettingsMenuItem = (pathname?: string, isLoading = false): MenuItemProps => {
  return {
    groupId: 7,
    id: 'settings',
    size: 'md',
    loading: isLoading,
    title: t('sidebar.settings'),
    selected: pathname?.includes(`/${amUIPath.Settings}`),
    icon: { svgElement: CogIcon, theme: 'default' },
    as: (props) => getMenuLinkAs(props, `/${amUIPath.Settings}`),
  };
};

export const getRequestsMenuItem = (pathname?: string, isLoading = false): MenuItemProps => {
  return {
    groupId: 2,
    id: '2.2',
    size: 'md',
    loading: isLoading,
    title: t('sidebar.requests'),
    selected: pathname?.includes(`/${amUIPath.Requests}`),
    icon: { svgElement: BellDotIcon, theme: 'default' },
    as: (props) => getMenuLinkAs(props, `/${amUIPath.Requests}`),
  };
};

export const getShortcutsMenuItem = (pathname?: string, isLoading = false): MenuItemProps[] => {
  return [
    {
      groupId: 'shortcuts',
      id: 'beta-about',
      size: 'md',
      loading: isLoading,
      title: t('header.new_altinn_info'),
      icon: InformationSquareIcon,
      selected: pathname?.includes(`/${amUIPath.Info}`),
      as: (props) => getMenuLinkAs(props, `/${amUIPath.Info}`),
    },
    {
      groupId: 'shortcuts',
      id: 'beta-leave',
      size: 'md',
      loading: isLoading,
      title: t('header.leave_beta'),
      icon: LeaveIcon,
      selected: false,
      as: (props) => getMenuLinkAs(props, getHostUrl() + 'ui/profile'),
    },
  ];
};

import React, { ComponentProps, JSX } from 'react';
import { type MenuItemProps } from '@altinn/altinn-components';
import {
  PersonGroupIcon,
  TenancyIcon,
  PadlockUnlockedIcon,
  HandshakeIcon,
  LeaveIcon,
  CogIcon,
  BellDotIcon,
  PadlockLockedFillIcon,
  KeyVerticalIcon,
  ExternalLinkIcon,
  DatabaseIcon,
} from '@navikt/aksel-icons';
import i18next, { t } from 'i18next';
import { Link } from 'react-router';

import { amUIPath, ConsentPath, SystemUserPath } from '@/routes/paths';
import { getAltinnStartPageUrl, getHostUrl } from '@/resources/utils/pathUtils';

const getMenuLinkAs = (
  props: ComponentProps<typeof Link>,
  toUrl: string,
  newTab?: boolean,
): JSX.Element => {
  return (
    <Link
      {...props}
      to={toUrl}
      target={newTab ? '_blank' : '_self'}
    />
  );
};

export const getHeadingMenuItem = (pathname?: string, isLoading = false): MenuItemProps => {
  return {
    id: '1',
    groupId: 11,
    icon: { svgElement: PadlockLockedFillIcon, theme: 'base' },
    size: 'lg',
    loading: isLoading,
    title: t('sidebar.access_management'),
    selected: pathname === '/',
    as: (props) => getMenuLinkAs(props, '/'),
  };
};

export const getUsersMenuItem = (
  pathname?: string,
  isLoading = false,
  isSmall = false,
): MenuItemProps => {
  return {
    groupId: 12,
    id: '2',
    size: 'md',
    loading: isLoading,
    title: t('sidebar.users'),
    selected: pathname?.includes(`/${amUIPath.Users}`),
    icon: { svgElement: PersonGroupIcon, theme: isSmall ? 'surface' : 'default' },
    as: (props) => getMenuLinkAs(props, `/${amUIPath.Users}`),
  };
};

export const getPoaOverviewMenuItem = (
  pathname?: string,
  isLoading = false,
  isSmall = false,
): MenuItemProps => {
  return {
    groupId: 12,
    id: '2.1',
    size: 'md',
    loading: isLoading,
    title: t('sidebar.poa_overview'),
    icon: { svgElement: KeyVerticalIcon, theme: isSmall ? 'surface' : 'default' },
    selected: pathname?.includes(`/${amUIPath.PoaOverview}`),
    as: (props) => getMenuLinkAs(props, `/${amUIPath.PoaOverview}`),
  };
};

export const getReporteesMenuItem = (
  pathname?: string,
  isLoading = false,
  isSmall = false,
): MenuItemProps => {
  return {
    groupId: 14,
    id: '4',
    size: 'md',
    loading: isLoading,
    title: t('sidebar.reportees'),
    selected: pathname?.includes(`/${amUIPath.Reportees}`),
    icon: { svgElement: PadlockUnlockedIcon, theme: isSmall ? 'surface' : 'default' },
    as: (props) => getMenuLinkAs(props, `/${amUIPath.Reportees}`),
  };
};

export const getConsentMenuItem = (
  pathname?: string,
  isLoading = false,
  isSmall = false,
): MenuItemProps => {
  return {
    groupId: 14,
    id: '4.1',
    size: 'md',
    loading: isLoading,
    title: t('sidebar.consent'),
    icon: { svgElement: HandshakeIcon, theme: isSmall ? 'surface' : 'default' },
    selected: pathname?.includes(`/${ConsentPath.Consent}`),
    as: (props) => getMenuLinkAs(props, `/${ConsentPath.Consent}/${ConsentPath.Active}`),
  };
};

export const getSystemUserMenuItem = (
  pathname?: string,
  isLoading = false,
  isSmall = false,
): MenuItemProps => {
  return {
    groupId: 16,
    id: '6',
    size: 'md',
    loading: isLoading,
    title: t('sidebar.systemaccess'),
    icon: { svgElement: TenancyIcon, theme: isSmall ? 'surface' : 'default' },
    selected: pathname?.includes(`/${SystemUserPath.SystemUser}`),
    as: (props) => getMenuLinkAs(props, `/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`),
  };
};

export const getClientAdministrationMenuItem = (
  pathname?: string,
  isLoading = false,
  isSmall = false,
): MenuItemProps => {
  return {
    groupId: 16,
    id: 'client-admin',
    size: 'md',
    loading: isLoading,
    title: t('sidebar.client_administration'),
    icon: { svgElement: DatabaseIcon, theme: isSmall ? 'surface' : 'default' },
    selected: pathname?.includes(`/${amUIPath.ClientAdministration}`),
    as: (props) => getMenuLinkAs(props, `/${amUIPath.ClientAdministration}`),
  };
};

export const getSettingsMenuItem = (
  pathname?: string,
  isLoading = false,
  isSmall = false,
): MenuItemProps => {
  return {
    groupId: 17,
    id: 'settings',
    size: 'md',
    loading: isLoading,
    title: t('sidebar.settings'),
    selected: pathname?.includes(`/${amUIPath.Settings}`),
    icon: { svgElement: CogIcon, theme: isSmall ? 'surface' : 'default' },
    as: (props) => getMenuLinkAs(props, `/${amUIPath.Settings}`),
  };
};

export const getRequestsMenuItem = (
  pathname?: string,
  isLoading = false,
  isSmall = false,
): MenuItemProps => {
  return {
    groupId: 12,
    id: '2.2',
    size: 'md',
    loading: isLoading,
    title: t('sidebar.requests'),
    selected: pathname?.includes(`/${amUIPath.Requests}`),
    icon: { svgElement: BellDotIcon, theme: isSmall ? 'surface' : 'default' },
    as: (props) => getMenuLinkAs(props, `/${amUIPath.Requests}`),
  };
};

export const getShortcutsMenuItem = (pathname?: string, isLoading = false): MenuItemProps[] => {
  const infoPortalUrl = getAltinnStartPageUrl(i18next.language);
  const helpPageUrl = infoPortalUrl + 'hjelp/ny-tilgangsstyring/';
  return [
    {
      groupId: 'shortcuts',
      id: 'beta-about',
      size: 'md',
      loading: isLoading,
      title: t('header.help_pages'),
      icon: ExternalLinkIcon,
      selected: false,
      as: (props) => getMenuLinkAs(props, helpPageUrl, true),
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

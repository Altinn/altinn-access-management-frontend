import React, { JSX } from 'react';
import { formatDisplayName, type MenuItemProps } from '@altinn/altinn-components';
import {
  PersonGroupIcon,
  TenancyIcon,
  PadlockUnlockedIcon,
  HandshakeIcon,
  InformationSquareIcon,
  LeaveIcon,
  LinkIcon,
  CogIcon,
  BellDotIcon,
} from '@navikt/aksel-icons';
import { t } from 'i18next';
import { Link } from 'react-router';

import { amUIPath, ConsentPath, SystemUserPath } from '@/routes/paths';
import { getHostUrl } from '@/resources/utils/pathUtils';
import { ReporteeInfo } from '@/rtk/features/userInfoApi';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getMenuLinkAs = (props: any, toUrl: string): JSX.Element => {
  return (
    <Link
      to={toUrl}
      {...props}
    />
  );
};

export const getHeadingMenuItem = (
  pathname?: string,
  isLoading = false,
  reportee?: ReporteeInfo,
): MenuItemProps => {
  return {
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
    icon: PersonGroupIcon,
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
    icon: PadlockUnlockedIcon,
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
    icon: LinkIcon,
    as: (props) => getMenuLinkAs(props, `/${amUIPath.Reportees}`),
  };
};

export const getConsentMenuItem = (pathname?: string, isLoading = false): MenuItemProps => {
  return {
    groupId: 5,
    id: '5',
    size: 'md',
    loading: isLoading,
    title: t('sidebar.consent'),
    icon: HandshakeIcon,
    selected: pathname?.includes(`/${ConsentPath.Consent}/`),
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
    icon: TenancyIcon,
    selected: pathname?.includes(`/${SystemUserPath.SystemUser}/`),
    as: (props) => getMenuLinkAs(props, `/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`),
  };
};

export const getSettingsMenuItem = (pathname?: string, isLoading = false): MenuItemProps => {
  return {
    groupId: 'settings-group',
    id: 'settings',
    size: 'md',
    loading: isLoading,
    title: t('sidebar.settings'),
    selected: pathname?.includes(`/${amUIPath.Settings}`),
    icon: CogIcon,
    as: (props) => getMenuLinkAs(props, `/${amUIPath.Settings}`),
  };
};

export const getRequestsMenuItem = (pathname?: string, isLoading = false): MenuItemProps => {
  return {
    groupId: '2',
    id: '2.2',
    size: 'md',
    loading: isLoading,
    title: t('sidebar.requests'),
    selected: pathname?.includes(`/${amUIPath.Requests}`),
    icon: BellDotIcon,
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

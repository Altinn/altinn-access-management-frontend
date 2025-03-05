import React from 'react';
import type { AccountMenuItem, MenuGroupProps, MenuItemProps } from '@altinn/altinn-components';
import { Layout, RootProvider } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import {
  HandshakeIcon,
  PersonGroupIcon,
  InboxIcon,
  TenancyIcon,
  MenuGridIcon,
  PersonChatIcon,
} from '@navikt/aksel-icons';

import {
  useGetReporteeListForAuthorizedUserQuery,
  useGetReporteeQuery,
  useGetUserInfoQuery,
} from '@/rtk/features/userInfoApi';
import { amUIPath, SystemUserPath } from '@/routes/paths';
import { getAltinnStartPageUrl, getHostUrl } from '@/resources/utils/pathUtils';

interface PageLayoutWrapperProps {
  children?: React.ReactNode;
}

const getAccountType = (type: string): 'company' | 'person' => {
  return type === 'Organization' ? 'company' : 'person';
};

export const PageLayoutWrapper = ({ children }: PageLayoutWrapperProps): React.ReactNode => {
  const { t } = useTranslation();
  const { data: reportee } = useGetReporteeQuery();
  const { data: userinfo } = useGetUserInfoQuery();

  const headerLinks: MenuItemProps[] = [
    {
      id: 'messagebox',
      title: t('header.inbox'),
      size: 'lg',
      icon: InboxIcon,
      as: (props) => (
        <Link
          to={`${getHostUrl()}ui/messagebox`}
          {...props}
        />
      ),
    },
    {
      icon: HandshakeIcon,
      id: 'access_management',
      size: 'lg',
      title: t('header.access_management'),
      selected: true,
      as: (props) => (
        <Link
          to={`/${amUIPath.Users}`}
          {...props}
        />
      ),
    },
    {
      id: 'all-services',
      groupId: 'global',
      icon: MenuGridIcon,
      title: t('header.all_services'),
      size: 'lg',
      as: (props) => (
        <Link
          to='https://info.altinn.no/skjemaoversikt'
          {...props}
        />
      ),
    },
    {
      id: 'chat',
      groupId: 'global',
      icon: PersonChatIcon,
      title: t('header.chat'),
      size: 'lg',
      as: (props) => (
        <Link
          to='https://info.altinn.no/hjelp/'
          {...props}
        />
      ),
    },
  ];

  const sidebarLinks: MenuItemProps[] = [
    {
      groupId: 1,
      icon: HandshakeIcon,
      id: '1',
      size: 'lg',
      title: t('header.access_management'),
    },
    {
      groupId: 3,
      id: '3',
      title: t('sidebar.users'),
      icon: PersonGroupIcon,
      as: (props) => (
        <Link
          to={`/${amUIPath.Users}`}
          {...props}
        />
      ),
    },
    {
      groupId: 4,
      id: '4',
      title: t('sidebar.reportees'),
      icon: InboxIcon,
      as: (props) => (
        <Link
          to={`/${amUIPath.Reportees}`}
          {...props}
        />
      ),
    },
    {
      groupId: 5,
      id: '5',
      title: t('sidebar.systemaccess'),
      icon: TenancyIcon,
      as: (props) => (
        <Link
          to={`/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`}
          {...props}
        />
      ),
    },
  ];

  const { data: reporteeList } = useGetReporteeListForAuthorizedUserQuery();

  const accountGroups: Record<string, MenuGroupProps> = {
    a: {
      title: t('header.account_you'),
      divider: true,
    },
    b: {
      title: t('header.account_others'),
      divider: true,
    },
  };

  const accounts: AccountMenuItem[] =
    reporteeList
      ?.map((account) => {
        const group = account.partyUuid === userinfo?.uuid ? 'a' : 'b';
        return {
          id: account.partyId,
          name: account?.name || '',
          group: account.partyUuid === userinfo?.uuid ? 'a' : 'b',
          groupId: group,
          type: getAccountType(account?.type ?? ''),
          selected: account.partyUuid === reportee?.partyUuid,
        };
      })
      .sort((a, b) => (a.groupId > b.groupId ? 1 : -1)) ?? [];

  return (
    <RootProvider>
      <Layout
        color={'company'}
        theme='subtle'
        header={{
          logo: { href: getAltinnStartPageUrl(), title: 'Altinn' },
          currentAccount: {
            name: reportee?.name || '',
            type: getAccountType(reportee?.type ?? ''),
            id: reportee?.partyUuid || '',
          },

          menu: {
            menuLabel: t('header.menu-label'),
            backLabel: t('header.back-label'),
            changeLabel: t('header.change-label'),
            accountGroups,
            accounts,
            onSelectAccount: (accountId) => {
              (window as Window).open(
                `${getHostUrl()}ui/Reportee/ChangeReporteeAndRedirect/?R=${accountId}&goTo=${window.location.href}`,
                '_self',
              );
            },
            items: headerLinks,
            logoutButton: {
              label: t('header.log_out'),
              onClick: () => {
                (window as Window).location =
                  `${getHostUrl()}ui/Authentication/Logout?languageID=1044`;
              },
            },
          },
        }}
        sidebar={{
          menu: {
            groups: {},
            items: sidebarLinks,
          },
        }}
        content={{ color: 'neutral' }}
        footer={{
          address: 'Postboks 1382 Vika, 0114 Oslo.',
          address2: 'Org.nr. 991 825 827',
          menu: {
            items: footerLinks.map((link) => ({
              href: link.href,
              id: link.resourceId,
              title: t(link.resourceId),
            })),
          },
        }}
      >
        {children}
      </Layout>
    </RootProvider>
  );
};

const footerLinks = [
  {
    href: 'https://info.altinn.no/om-altinn/',
    resourceId: 'footer.about_altinn',
  },
  {
    href: 'https://info.altinn.no/om-altinn/driftsmeldinger/',
    resourceId: 'footer.service_messages',
  },
  {
    href: 'https://info.altinn.no/om-altinn/personvern/',
    resourceId: 'footer.privacy_policy',
  },
  {
    href: 'https://info.altinn.no/om-altinn/tilgjengelighet/',
    resourceId: 'footer.accessibility',
  },
];

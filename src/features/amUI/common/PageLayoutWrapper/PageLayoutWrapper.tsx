import type { AccountMenuItem, MenuItemProps } from '@altinn/altinn-components';
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
  // useGetUserInfoQuery,
} from '@/rtk/features/userInfoApi';
import { amUIPath, SystemUserPath } from '@/routes/paths';
import { getAltinnStartPageUrl, getHostUrl } from '@/resources/utils/pathUtils';

interface PageLayoutWrapperProps {
  children?: React.ReactNode;
}

export const PageLayoutWrapper = ({ children }: PageLayoutWrapperProps): React.ReactNode => {
  const { t } = useTranslation();
  const { data: reportee } = useGetReporteeQuery();
  // const { data: userinfo } = useGetUserInfoQuery();

  const headerLinks: MenuItemProps[] = [
    {
      groupId: 1,
      icon: HandshakeIcon,
      id: '1',
      size: 'lg',
      title: 'Tilgangsstyring',
      as: (props) => (
        <Link
          to={`/${amUIPath.Users}`}
          target='__blank'
          rel='noopener noreferrer'
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
          target='__blank'
          rel='noopener noreferrer'
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
          target='__blank'
          rel='noopener noreferrer'
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
      title: 'Tilgangsstyring',
    },
    {
      groupId: 2,
      id: '2',
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
      groupId: 3,
      id: '3',
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
      groupId: 4,
      id: '4',
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

  const accounts: AccountMenuItem[] =
    reporteeList?.map((reportee) => ({
      id: reportee.partyId,
      name: reportee?.name || '',
      selected: true,
      type: reportee?.type === 'Organization' ? 'company' : 'person',
    })) ?? [];

  return (
    <RootProvider>
      <Layout
        color={'company'}
        theme='subtle'
        header={{
          logo: { href: getAltinnStartPageUrl(), title: 'Altinn' },
          currentAccount: {
            name: reportee?.name || '',
            type: reportee?.type === 'Organization' ? 'company' : 'person',
            id: reportee?.partyUuid || '',
          },

          menu: {
            menuLabel: t('header.menu-label'),
            backLabel: t('header.back-label'),
            changeLabel: t('header.change-label'),
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

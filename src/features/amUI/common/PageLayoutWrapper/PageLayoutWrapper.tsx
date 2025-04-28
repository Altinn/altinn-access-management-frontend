import type { ChangeEvent } from 'react';
import React, { useState } from 'react';
import type { AccountMenuItem, MenuGroupProps, MenuItemProps } from '@altinn/altinn-components';
import { Layout, RootProvider, Snackbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import { HandshakeIcon, InboxIcon, MenuGridIcon, PersonChatIcon } from '@navikt/aksel-icons';

import { SidebarItems } from './SidebarItems';

import {
  useGetReporteeListForAuthorizedUserQuery,
  useGetReporteeQuery,
  useGetUserInfoQuery,
} from '@/rtk/features/userInfoApi';
import { amUIPath } from '@/routes/paths';
import { getAltinnStartPageUrl, getHostUrl } from '@/resources/utils/pathUtils';
import { useIsTabletOrSmaller } from '@/resources/utils/screensizeUtils';

interface PageLayoutWrapperProps {
  children?: React.ReactNode;
}

const getAccountType = (type: string): 'company' | 'person' => {
  return type === 'Organization' ? 'company' : 'person';
};

export const PageLayoutWrapper = ({ children }: PageLayoutWrapperProps): React.ReactNode => {
  const { t, i18n } = useTranslation();
  const { data: reportee } = useGetReporteeQuery();
  const { data: userinfo } = useGetUserInfoQuery();
  const { pathname } = useLocation();
  const [searchString, setSearchString] = useState<string>('');

  const onChangeLocale = async (event: ChangeEvent<HTMLInputElement>) => {
    const newLocale = event.target.value;
    i18n.changeLanguage(newLocale);
    document.cookie = `selectedLanguage=${newLocale}; path=/; SameSite=Lax`;
  };

  const isSm = useIsTabletOrSmaller();
  const headerLinks: MenuItemProps[] = [
    {
      groupId: 1,
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
      groupId: 1,
      icon: HandshakeIcon,
      id: 'access_management',
      size: 'lg',
      title: t('header.access_management'),
      as: (props) => (
        <Link
          to={`/${amUIPath.Users}`}
          {...props}
        />
      ),
    },
    ...(isSm ? SidebarItems(true, pathname) : []),
    {
      id: 'all-services',
      groupId: 10,
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
      groupId: 10,
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
          locale: {
            title: t('header.locale_title'),
            options: [
              { label: 'Norsk (bokmål)', value: 'no_nb', checked: i18n.language === 'no_nb' },
              { label: 'Norsk (nynorsk)', value: 'no_nn', checked: i18n.language === 'no_nn' },
              { label: 'English', value: 'en', checked: i18n.language === 'en' },
            ],
            onChange: onChangeLocale,
          },
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
            accountSearch: {
              name: 'account-search',
              value: searchString,
              onChange: (event: ChangeEvent<HTMLInputElement>) => {
                setSearchString(event.target.value);
              },
              placeholder: t('header.search-label'),
              hidden: false,
              getResultsLabel: (hits: number) => {
                return `${hits} ${t('header.search-hits')}`;
              },
            },
            isVirtualized: accounts.length > 20,
            onSelectAccount: (accountId) => {
              const redirectUrl = window.location.pathname.includes('systemuser')
                ? `${window.location.origin}/accessmanagement/ui/systemuser/overview`
                : window.location.href;
              (window as Window).open(
                `${getHostUrl()}ui/Reportee/ChangeReporteeAndRedirect/?R=${accountId}&goTo=${redirectUrl}`,
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
            items: SidebarItems(false, pathname),
          },
        }}
        content={{ color: 'company' }}
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
      <Snackbar />
    </RootProvider>
  );
};

const footerLinks = [
  { href: 'https://info.altinn.no/om-altinn/', resourceId: 'footer.about_altinn' },
  {
    href: 'https://info.altinn.no/om-altinn/driftsmeldinger/',
    resourceId: 'footer.service_messages',
  },
  { href: 'https://info.altinn.no/om-altinn/personvern/', resourceId: 'footer.privacy_policy' },
  { href: 'https://info.altinn.no/om-altinn/tilgjengelighet/', resourceId: 'footer.accessibility' },
];

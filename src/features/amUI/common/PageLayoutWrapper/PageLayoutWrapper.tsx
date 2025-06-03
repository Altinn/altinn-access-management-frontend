import type { ChangeEvent } from 'react';
import React, { useMemo, useState } from 'react';
import type { MenuGroupProps, MenuItemProps } from '@altinn/altinn-components';
import { Layout, RootProvider, Snackbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import { HandshakeIcon, InboxIcon, MenuGridIcon, PersonChatIcon } from '@navikt/aksel-icons';

import type { ReporteeInfo } from '@/rtk/features/userInfoApi';
import {
  useGetReporteeListForAuthorizedUserQuery,
  useGetReporteeQuery,
  useGetUserInfoQuery,
} from '@/rtk/features/userInfoApi';
import { amUIPath } from '@/routes/paths';
import { getAltinnStartPageUrl, getHostUrl } from '@/resources/utils/pathUtils';
import { useIsTabletOrSmaller } from '@/resources/utils/screensizeUtils';

import { SidebarItems } from './SidebarItems';

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
  const { data: reporteeList } = useGetReporteeListForAuthorizedUserQuery();
  const { pathname } = useLocation();
  const [searchString, setSearchString] = useState<string>('');

  const onChangeLocale = (event: ChangeEvent<HTMLInputElement>) => {
    const newLocale = event.target.value;
    i18n.changeLanguage(newLocale);
    document.cookie = `selectedLanguage=${newLocale}; path=/; SameSite=Strict`;
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

  const accounts = useMemo(() => {
    if (!reporteeList || !userinfo || !reportee) {
      return [];
    }

    const accountList = [];
    for (const account of reporteeList ?? []) {
      const mappedAccount = getAccount(account, userinfo.uuid, reportee.partyUuid);
      accountList.push(mappedAccount);

      if (account.subunits && account.subunits.length > 0) {
        for (const subUnit of account.subunits) {
          const mappedSubUnit = getAccount(subUnit, userinfo.uuid, reportee.partyUuid);
          accountList.push(mappedSubUnit);
        }
      }
    }
    return accountList.sort((a, b) => (a.groupId > b.groupId ? 1 : -1)) ?? [];
  }, [reporteeList, userinfo, reportee]);

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
          menu: {
            accountMenu: {
              items: accounts,
              groups: accountGroups,
              currentAccount: {
                name: reportee?.name || '',
                type: getAccountType(reportee?.type ?? ''),
                id: reportee?.partyUuid || '',
              },
              search: {
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
              onSelectAccount: (accountId) => {
                const redirectUrl = window.location.pathname.includes('systemuser')
                  ? `${window.location.origin}/accessmanagement/ui/systemuser/overview`
                  : window.location.href;
                (window as Window).open(
                  `${getHostUrl()}ui/Reportee/ChangeReporteeAndRedirect/?R=${accountId}&goTo=${redirectUrl}`,
                  '_self',
                );
              },
              menuItemsVirtual: {
                isVirtualized: accounts.length > 20,
              },
            },
            menuLabel: t('header.menu-label'),
            backLabel: t('header.back-label'),
            changeLabel: t('header.change-label'),
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

const getAccount = (reportee: ReporteeInfo, userUuid: string, currentReporteeUuid: string) => {
  const group = reportee.partyUuid === userUuid ? 'a' : 'b';
  const accountType = getAccountType(reportee?.type ?? '');
  return {
    id: reportee.partyId,
    name:
      accountType == 'person'
        ? reportee.name
        : `${reportee.name}  (${reportee.organizationNumber})`,
    group: reportee.partyUuid === userUuid ? 'a' : 'b',
    groupId: group,
    type: accountType,
    selected: reportee.partyUuid === currentReporteeUuid,
  };
};

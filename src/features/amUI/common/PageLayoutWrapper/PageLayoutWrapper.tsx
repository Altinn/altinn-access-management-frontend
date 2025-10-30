import type { ChangeEvent } from 'react';
import React, { useState } from 'react';
import type {
  AccountMenuItemProps,
  MenuItemProps,
  MenuItemSize,
  Theme,
} from '@altinn/altinn-components';
import { Layout, RootProvider, Snackbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import {
  HandshakeIcon,
  InboxFillIcon,
  InformationSquareIcon,
  LeaveIcon,
  PersonCircleIcon,
} from '@navikt/aksel-icons';

import {
  useGetIsAdminQuery,
  useGetIsClientAdminQuery,
  useGetIsCompanyProfileAdminQuery,
  useGetReporteeListForAuthorizedUserQuery,
  useGetActorListForAuthorizedUserQuery,
  useGetReporteeQuery,
  useGetUserInfoQuery,
  useGetFavoriteActorUuidsQuery,
} from '@/rtk/features/userInfoApi';
import { amUIPath, ConsentPath, GeneralPath, SystemUserPath } from '@/routes/paths';
import { getAfUrl, getAltinnStartPageUrl, getHostUrl } from '@/resources/utils/pathUtils';
import { useIsTabletOrSmaller } from '@/resources/utils/screensizeUtils';

import { SidebarItems } from './SidebarItems';
import { InfoModal } from './InfoModal';
import { crossPlatformLinksEnabled, useNewActorList } from '@/resources/utils/featureFlagUtils';
import { useAccounts } from './useAccounts';

interface PageLayoutWrapperProps {
  children?: React.ReactNode;
}

const getAccountType = (type: string): 'company' | 'person' => {
  return type === 'Organization' ? 'company' : 'person';
};

export const PageLayoutWrapper = ({ children }: PageLayoutWrapperProps): React.ReactNode => {
  const { t, i18n } = useTranslation();
  const useNewActorListFlag = useNewActorList();
  const { data: reportee, isLoading: isLoadingReportee } = useGetReporteeQuery();
  const { data: userinfo } = useGetUserInfoQuery();
  const { data: reporteeList } = useGetReporteeListForAuthorizedUserQuery(undefined, {
    skip: useNewActorListFlag,
  });
  const { data: actorList } = useGetActorListForAuthorizedUserQuery(undefined, {
    skip: !useNewActorListFlag,
  });
  const { pathname } = useLocation();
  const [searchString, setSearchString] = useState<string>('');

  const { data: isAdmin, isLoading: isLoadingIsAdmin } = useGetIsAdminQuery();
  const { data: isClientAdmin, isLoading: isLoadingIsClientAdmin } = useGetIsClientAdminQuery();
  const { data: canAccessSettings, isLoading: isLoadingCompanyProfileAdmin } =
    useGetIsCompanyProfileAdminQuery();

  const onChangeLocale = (newLocale: string) => {
    i18n.changeLanguage(newLocale);
    document.cookie = `selectedLanguage=${newLocale}; path=/; SameSite=Strict`;
  };

  const menuGroups = {
    shortcuts: {
      divider: false,
      title: t('header.shortcuts'),
      defaultIconTheme: 'transparent' as Theme,
      defaultItemSize: 'sm' as MenuItemSize,
    },
    global: {
      divider: false,
    },
  };

  const isSm = useIsTabletOrSmaller();
  const isLoadingMenu =
    isLoadingReportee || isLoadingIsAdmin || isLoadingIsClientAdmin || isLoadingCompanyProfileAdmin;

  const platformLinks = [
    {
      groupId: 1,
      icon: InboxFillIcon,
      id: 'inbox',
      size: 'lg',
      title: t('header.inbox'),
      as: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a
          {...props}
          href={getAfUrl()}
        />
      ),
      badge: { label: t('common.beta') },
    },
    {
      groupId: 'current-user',
      icon: PersonCircleIcon,
      id: 'profile',
      size: 'sm',
      title: t('header.profile'),
      as: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a
          {...props}
          href={`${getAfUrl()}profile`}
        />
      ),
    },
  ] as MenuItemProps[];

  const headerLinks: MenuItemProps[] = [
    {
      groupId: 1,
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
      badge: { label: t('common.beta') },
    },
    ...(crossPlatformLinksEnabled() ? platformLinks : []),
    ...(isSm
      ? SidebarItems(
          true,
          isLoadingMenu,
          pathname,
          isAdmin,
          isClientAdmin,
          reportee,
          canAccessSettings ?? false,
        )
      : []),
    {
      id: 'info',
      groupId: 10,
      icon: InformationSquareIcon,
      title: t('header.new_altinn_info'),
      size: 'lg',
      as: (props) => (
        <Link
          to={`/${amUIPath.Info}`}
          {...props}
        />
      ),
    },
    {
      id: 'leave_beta',
      groupId: 10,
      icon: LeaveIcon,
      title: t('header.leave_beta'),
      size: 'lg',
      as: (props) => (
        <Link
          to={getHostUrl() + 'ui/profile'}
          {...props}
        />
      ),
    },
    { groupId: 'current-user', hidden: true },
  ];

  const { accounts, accountGroups } = useAccounts({ reporteeList, actorList });

  const globalMenu = {
    accountMenu: {
      items: accounts,
      groups: accountGroups,
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
      isVirtualized: accounts.length > 20,
    },
    onSelectAccount: (accountId: string) => {
      // check if this is a person; then redirect to consents page
      let redirectUrl = window.location.href;
      const isPersonAccount = accounts.find((a) => a.id === accountId)?.type === 'person';
      if (isPersonAccount) {
        redirectUrl = new URL(
          `${window.location.origin}${GeneralPath.BasePath}/${ConsentPath.Consent}/${ConsentPath.Active}`,
        ).toString();
      } else if (window.location.pathname.includes(`/${SystemUserPath.SystemUser}`)) {
        redirectUrl = new URL(
          `${window.location.origin}${GeneralPath.BasePath}/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`,
        ).toString();
      }

      const changeUrl = new URL(`${getHostUrl()}ui/Reportee/ChangeReporteeAndRedirect/`);
      changeUrl.searchParams.set(useNewActorListFlag ? 'P' : 'R', accountId);
      changeUrl.searchParams.set('goTo', redirectUrl);
      (window as Window).open(changeUrl.toString(), '_self');
    },
    logoutButton: {
      label: t('header.log_out'),
      onClick: () => {
        (window as Window).location = `${getHostUrl()}ui/Authentication/Logout?languageID=1044`;
      },
    },

    menuLabel: t('header.menu-label'),
    backLabel: t('header.back-label'),
    changeLabel: t('header.change-label'),

    currentAccount: {
      name: reportee?.name || '',
      type: getAccountType(reportee?.type ?? ''),
      id: reportee?.partyId || '',
    },
  };

  const groups = {
    'current-user': {
      title: t('header.logged_in_as_name', {
        name: userinfo?.name || '',
      }),
    },
  };

  const desktopMenu = {
    items: headerLinks,
    groups,
  };

  const mobileMenu = {
    items: headerLinks,
    groups,
  };

  return (
    <RootProvider>
      <Layout
        color={reportee?.type ? getAccountType(reportee.type) : 'neutral'}
        theme='subtle'
        header={{
          locale: {
            title: t('header.locale_title'),
            options: [
              { label: 'Norsk (bokmål)', value: 'no_nb', checked: i18n.language === 'no_nb' },
              { label: 'Norsk (nynorsk)', value: 'no_nn', checked: i18n.language === 'no_nn' },
              { label: 'English', value: 'en', checked: i18n.language === 'en' },
            ],
            onSelect: onChangeLocale,
          },
          logo: { href: getAltinnStartPageUrl(), title: 'Altinn' },
          currentAccount: {
            name: reportee?.name || '',
            type: getAccountType(reportee?.type ?? ''),
            id: reportee?.partyId || '',
            icon: { name: reportee?.name || '', type: getAccountType(reportee?.type ?? '') },
          },
          globalMenu: globalMenu,
          desktopMenu: desktopMenu,
          mobileMenu: mobileMenu,
        }}
        sidebar={{
          menu: {
            variant: 'subtle',
            groups: menuGroups,
            items: SidebarItems(
              false,
              isLoadingMenu,
              pathname,
              isAdmin,
              isClientAdmin,
              reportee,
              canAccessSettings ?? false,
            ),
          },
        }}
        content={{ color: reportee?.type ? getAccountType(reportee.type) : 'neutral' }}
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
        <InfoModal />
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

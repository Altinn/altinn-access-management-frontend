import type { ChangeEvent } from 'react';
import React, { useMemo, useState } from 'react';
import type {
  AccountMenuItemProps,
  MenuGroupProps,
  MenuItemProps,
  MenuItemSize,
  Theme,
} from '@altinn/altinn-components';
import {
  Icon,
  Layout,
  MenuItem,
  RootProvider,
  SizeEnum,
  Snackbar,
} from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import {
  HandshakeIcon,
  InboxFillIcon,
  InformationSquareIcon,
  LeaveIcon,
  PersonCircleIcon,
} from '@navikt/aksel-icons';

import type { Connection, ReporteeInfo } from '@/rtk/features/userInfoApi';
import {
  useGetIsAdminQuery,
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

interface PageLayoutWrapperProps {
  children?: React.ReactNode;
}

const getAccountType = (type: string): 'company' | 'person' => {
  return type === 'Organization' ? 'company' : 'person';
};

const getAccountTypeFromConnection = (type: string): 'company' | 'person' => {
  return type === 'Organisasjon' ? 'company' : 'person';
};

export const PageLayoutWrapper = ({ children }: PageLayoutWrapperProps): React.ReactNode => {
  const { t, i18n } = useTranslation();
  const useNewActorListFlag = useNewActorList();
  const { data: reportee } = useGetReporteeQuery();
  const { data: userinfo } = useGetUserInfoQuery();
  const { data: reporteeList } = useGetReporteeListForAuthorizedUserQuery(undefined, {
    skip: useNewActorListFlag,
  });
  const { data: actorList } = useGetActorListForAuthorizedUserQuery(undefined, {
    skip: !useNewActorListFlag,
  });
  const { data: favoriteUuids } = useGetFavoriteActorUuidsQuery();
  const { pathname } = useLocation();
  const [searchString, setSearchString] = useState<string>('');

  const { data: isAdmin } = useGetIsAdminQuery();

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
          pathname,
          isAdmin,
          reportee?.name || '',
          getAccountType(reportee?.type ?? ''),
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

  const accountGroups: Record<string, MenuGroupProps> = {
    self: {
      title: t('header.account_you'),
      divider: true,
    },
    others: {
      title: t('header.account_others'),
      divider: true,
    },
    favorites: {
      title: t('header.account_favorites'),
      divider: true,
    },
  };

  const accounts: AccountMenuItemProps[] = useMemo(() => {
    if ((!reporteeList && !actorList) || !userinfo || !reportee) {
      return [];
    }

    const accountList = [];
    if (useNewActorListFlag) {
      for (const account of actorList ?? []) {
        const mappedAccount = getAccountFromConnection(account, userinfo.uuid, reportee.partyUuid);
        accountList.push(mappedAccount);
        if (favoriteUuids?.includes(account.party.id)) {
          const favoriteAccount = { ...mappedAccount, groupId: 'favorites' };
          accountList.push(favoriteAccount);
        }
      }
    } else {
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
    }

    return (
      accountList.sort((a, b) => {
        if (a.groupId === 'self') return -1;
        if (b.groupId === 'self') return 1;
        if (b.groupId !== 'self' && a.groupId === 'favorites') return -1;
        if (a.groupId !== 'self' && b.groupId === 'favorites') return 1;
        return a.name > b.name ? 1 : -1;
      }) ?? []
    );
  }, [reporteeList, userinfo, reportee]);

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
      menuItemsVirtual: { isVirtualized: accounts.length > 20 },
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
      changeUrl.searchParams.set('R', accountId);
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
            icon: {
              name: reportee?.name || '',
              type: getAccountType(reportee?.type ?? ''),
            },
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
              pathname,
              isAdmin,
              reportee?.name || '',
              getAccountType(reportee?.type ?? ''),
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

const getAccount = (
  reportee: ReporteeInfo,
  userUuid: string,
  currentReporteeUuid: string,
): AccountMenuItemProps => {
  const group = reportee.partyUuid === userUuid ? 'a' : 'b';
  const accountType = getAccountType(reportee?.type ?? '');
  return {
    id: reportee.partyId,
    icon: {
      name: reportee.name,
      type: accountType,
    },
    name: reportee.name,
    description: reportee.type === 'Organization' ? reportee.organizationNumber : undefined,
    groupId: group,
    type: accountType,
    selected: reportee.partyUuid === currentReporteeUuid,
  };
};

const getAccountFromConnection = (
  actorConnection: Connection,
  userUuid: string,
  currentReporteeUuid: string,
): AccountMenuItemProps => {
  const accountType = getAccountTypeFromConnection(actorConnection?.party.type ?? '');
  const isSubUnit = actorConnection.party.type === 'Organisasjon' && !!actorConnection.party.parent;
  const group =
    actorConnection.party.id === userUuid
      ? 'self'
      : isSubUnit
        ? actorConnection.party.parent?.id
        : actorConnection.party.id;
  const description = isSubUnit
    ? '↪ Org. nr:' +
      actorConnection.party.keyValues?.OrganizationIdentifier +
      `, del av ${actorConnection.party.parent?.name}`
    : actorConnection.party.type === 'Organisasjon'
      ? 'Org. nr:' + actorConnection.party.keyValues?.OrganizationIdentifier
      : 'Født: ' + actorConnection.party.keyValues?.DateOfBirth;

  return {
    id: actorConnection.party.keyValues?.PartyId ?? actorConnection.party.id,
    icon: {
      name: actorConnection.party.name,
      type: accountType,
      variant: actorConnection.party.parent ? 'outline' : 'solid',
    },
    name: actorConnection.party.name,
    description: description,
    groupId: group,
    type: accountType,
    selected: actorConnection.party.id === currentReporteeUuid,
  };
};

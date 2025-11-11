import {
  crossPlatformLinksEnabled,
  useNewActorList,
  useNewHeader,
} from '@/resources/utils/featureFlagUtils';
import { getAfUrl, getHostUrl, getLogoutUrl } from '@/resources/utils/pathUtils';
import { useIsTabletOrSmaller } from '@/resources/utils/screensizeUtils';
import { amUIPath } from '@/routes/paths';
import {
  PartyType,
  useGetActorListForAuthorizedUserQuery,
  useGetIsAdminQuery,
  useGetIsClientAdminQuery,
  useGetIsCompanyProfileAdminQuery,
  useGetReporteeListForAuthorizedUserQuery,
  useGetReporteeQuery,
  useGetUserInfoQuery,
} from '@/rtk/features/userInfoApi';
import { Theme, MenuItemSize, MenuItemProps, formatDisplayName } from '@altinn/altinn-components';
import {
  InboxFillIcon,
  PersonCircleIcon,
  HandshakeIcon,
  InformationSquareIcon,
  LeaveIcon,
} from '@navikt/aksel-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router';
import { SidebarItems } from './SidebarItems';

const getAccountType = (type: string): 'company' | 'person' => {
  return type === 'Organization' ? 'company' : 'person';
};

export const useGlobalMenu = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const useNewHeaderFlag = useNewHeader();
  const useNewActorListFlag = useNewActorList();
  const isSm = useIsTabletOrSmaller();
  const { data: reportee, isLoading: isLoadingReportee } = useGetReporteeQuery();
  const { data: userinfo } = useGetUserInfoQuery();
  const { data: reporteeList, isLoading: isLoadingReporteeList } =
    useGetReporteeListForAuthorizedUserQuery(undefined, {
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
      groupId: 2,
      icon: HandshakeIcon,
      id: 'access_management',
      size: 'lg',
      title: t('header.access_management'),
      selected: true,
      as: (props) => (
        <Link
          to={`/${amUIPath.LandingPage}`}
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

  const globalMenu = {
    logoutButton: {
      label: t('header.log_out'),
      onClick: async () => {
        const logoutUrl = getLogoutUrl();
        window.location.assign(logoutUrl);
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
        name: formatDisplayName({
          fullName: userinfo?.name || '',
          type: userinfo?.party?.partyTypeName === PartyType.Person ? 'person' : 'company',
          reverseNameOrder: true,
        }),
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

  return { globalMenu, desktopMenu, mobileMenu, menuGroups, isLoadingMenu };
};

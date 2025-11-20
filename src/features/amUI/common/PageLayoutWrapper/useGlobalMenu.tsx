import {
  crossPlatformLinksEnabled,
  useNewActorList,
  useNewHeader,
} from '@/resources/utils/featureFlagUtils';
import { getAfUrl, getAltinnInfoUrl, getHostUrl, getLogoutUrl } from '@/resources/utils/pathUtils';
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
  InformationSquareIcon,
  PadlockLockedFillIcon,
  MenuGridIcon,
  Buildings2Icon,
  ChatExclamationmarkIcon,
} from '@navikt/aksel-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router';
import { SidebarItems } from './SidebarItems';

const getAccountType = (type: string): 'company' | 'person' => {
  return type === 'Organization' ? 'company' : 'person';
};

const linkUrls = {
  forms: {
    no_nb: 'skjemaoversikt',
    no_nn: 'nn/skjemaoversikt/',
    en: 'en/forms-overview/',
  },
  about: {
    no_nb: 'nyheter/om-nye-altinn',
    no_nn: 'nn/nyheiter/om-nye-altinn',
    en: 'en/news/About-the-new-Altinn',
  },
  'start-business': {
    no_nb: 'starte-og-drive',
    no_nn: 'nn/starte-og-drive',
    en: 'en/start-and-run-business',
  },
  help: {
    no_nb: 'hjelp',
    no_nn: 'nn/hjelp',
    en: 'en/help',
  },
};

export const useGlobalMenu = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const lang = i18n.language as 'no_nb' | 'no_nn' | 'en';
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

  const headerLinks: MenuItemProps[] = [
    {
      groupId: 1,
      icon: { svgElement: InboxFillIcon, theme: 'subtle' },
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
      groupId: 1,
      icon: { svgElement: PadlockLockedFillIcon, theme: 'subtle' },
      id: 'access_management',
      size: 'lg',
      title: t('header.access_management'),
      selected: true,
      as: (props) => (
        <Link
          to={'/'}
          {...props}
        />
      ),
      badge: { label: t('common.beta') },
    },
    {
      groupId: 1,
      icon: { svgElement: MenuGridIcon, theme: 'subtle' },
      id: 'all_forms',
      size: 'lg',
      title: t('header.all_forms'),
      as: (props) => (
        <a
          {...props}
          href={`${getAltinnInfoUrl()}/${linkUrls['forms'][lang] ?? linkUrls['forms']['no_nb']}`}
        />
      ),
    },
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
      size: 'sm',
      as: (props) => (
        <a
          {...props}
          href={`${getAltinnInfoUrl()}/${linkUrls['about'][lang] ?? linkUrls['about']['no_nb']}`}
        />
      ),
    },
    {
      id: 'starte-og-drive',
      groupId: 10,
      icon: Buildings2Icon,
      title: t('header.start_business'),
      size: 'sm',
      as: (props) => (
        <a
          {...props}
          href={`${getAltinnInfoUrl()}/${linkUrls['start-business'][lang] ?? linkUrls['start-business']['no_nb']}`}
        />
      ),
    },
    {
      id: 'trenger-du-hjelp',
      groupId: 10,
      icon: ChatExclamationmarkIcon,
      title: t('header.help'),
      size: 'sm',
      as: (props) => (
        <a
          {...props}
          href={`${getAltinnInfoUrl()}/${linkUrls['help'][lang] ?? linkUrls['help']['no_nb']}`}
        />
      ),
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

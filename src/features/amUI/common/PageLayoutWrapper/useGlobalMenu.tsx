import { type Theme, type MenuItemSize, type MenuItemProps } from '@altinn/altinn-components';
import {
  InboxFillIcon,
  PersonCircleIcon,
  PadlockLockedFillIcon,
  MenuGridIcon,
  Buildings2Icon,
  ChatExclamationmarkIcon,
  MagnifyingGlassIcon,
} from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { formatEntityDisplayName } from '@/resources/utils/reporteeUtils';
import { useGetReporteeQuery, useGetUserProfileQuery } from '@/rtk/features/userInfoApi';
import { useIsTabletOrSmaller } from '@/resources/utils/screensizeUtils';
import { getAfUrl, getAltinnStartPageUrl, getLogoutUrl } from '@/resources/utils/pathUtils';

import { useSidebarItems } from './useSidebarItems';

const getAccountType = (type: string): 'company' | 'person' => {
  return type === 'Organization' ? 'company' : 'person';
};

const linkUrls = {
  forms: {
    no_nb: 'skjemaoversikt',
    no_nn: 'skjemaoversikt',
    en: 'forms-overview',
  },
  'start-business': {
    no_nb: 'starte-og-drive',
    no_nn: 'starte-og-drive',
    en: 'start-and-run-business',
  },
  help: {
    no_nb: 'hjelp',
    no_nn: 'hjelp',
    en: 'help',
  },
  search: {
    no_nb: 'sok',
    no_nn: 'sok',
    en: 'search',
  },
};

export const useGlobalMenu = ({
  hideSidebarItems = false,
}: {
  hideSidebarItems?: boolean;
} = {}) => {
  const { t, i18n } = useTranslation();

  const lang = i18n.language as 'no_nb' | 'no_nn' | 'en';
  const isSm = useIsTabletOrSmaller();
  const { data: reportee } = useGetReporteeQuery();
  const { data: userinfo } = useGetUserProfileQuery();

  const { sidebarItems, shortcutsMenuItem } = useSidebarItems({ isSmall: true });

  const getLocalizedLinkUrl = (link: keyof typeof linkUrls) =>
    `${getAltinnStartPageUrl()}${linkUrls[link][lang] ?? linkUrls[link].no_nb}`;

  const headerLinks: MenuItemProps[] = [
    {
      groupId: 'global',
      icon: { svgElement: InboxFillIcon, theme: 'surface' },
      id: 'inbox',
      size: 'lg',
      title: t('header.inbox'),
      href: getAfUrl(),
    },
    {
      groupId: 'global',
      icon: { svgElement: PadlockLockedFillIcon, theme: 'surface' },
      id: 'access_management',
      size: 'lg',
      title: t('header.access_management'),
      selected: true,
      expanded: isSm && !hideSidebarItems,
      as: (props) => (
        <Link
          to={'/'}
          {...props}
        />
      ),
      items: sidebarItems,
    },
    {
      groupId: 'global',
      icon: { svgElement: MenuGridIcon, theme: 'surface' },
      id: 'all_forms',
      size: 'lg',
      title: t('header.all_forms'),
      href: getLocalizedLinkUrl('forms'),
    },
    {
      groupId: 'global',
      icon: { svgElement: MagnifyingGlassIcon, theme: 'surface' },
      id: 'search',
      size: 'lg',
      title: t('header.search'),
      href: getLocalizedLinkUrl('search'),
    },
    {
      id: 'starte-og-drive',
      groupId: 'links',
      icon: Buildings2Icon,
      title: t('header.start_business'),
      size: 'sm',
      href: getLocalizedLinkUrl('start-business'),
    },
    {
      id: 'trenger-du-hjelp',
      groupId: 'links',
      icon: ChatExclamationmarkIcon,
      title: t('header.help'),
      size: 'sm',
      href: getLocalizedLinkUrl('help'),
    },
    {
      groupId: 'current-user',
      icon: PersonCircleIcon,
      id: 'profile',
      size: 'sm',
      title: t('header.profile'),
      href: `${getAfUrl()}profile`,
    },
    ...(isSm && !hideSidebarItems ? shortcutsMenuItem : []),
  ];

  const globalMenu = {
    logoutButton: {
      label: t('header.log_out'),
      onClick: () => {
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
    global: { divider: true },
    links: { divider: true },
    'current-user': {
      title: t('header.logged_in_as_name', {
        name: formatEntityDisplayName(userinfo?.party, true),
      }),
    },
    shortcuts: {
      divider: true,
      title: t('header.shortcuts'),
      defaultIconTheme: 'transparent' as Theme,
      defaultItemSize: 'sm' as MenuItemSize,
    },
  };

  const desktopMenu = {
    id: 'global-menu',
    items: headerLinks,
    groups,
  };

  const mobileMenu = {
    id: 'global-menu',
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

  return { globalMenu, desktopMenu, mobileMenu, menuGroups };
};

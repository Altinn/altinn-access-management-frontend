import { amUIPath, SystemUserPath } from '@/routes/paths';
import { MenuItemProps } from '@altinn/altinn-components';
import { HandshakeIcon, InboxIcon, PersonGroupIcon, TenancyIcon } from '@navikt/aksel-icons';
import { t } from 'i18next';
import { Link } from 'react-router';

/**
 * Generates a list of sidebar items for the page layout.
 *
 * @returns {MenuItemProps[]} A list of sidebar items, including a heading,
 *                            and optionally a confetti package if the feature flag is enabled.
 */
export const SidebarItems = () => {
  const displayConfettiPackage = window.featureFlags?.confettiPackage;

  const heading: MenuItemProps = {
    groupId: 1,
    icon: HandshakeIcon,
    id: '1',
    size: 'lg',
    title: t('sidebar.access_management'),
  };

  const confettiPackage: MenuItemProps[] = [
    {
      groupId: 2,
      id: '2',
      size: 'md',
      title: t('sidebar.users'),
      icon: PersonGroupIcon,
      as: (props: any) => (
        <Link
          to={`/${amUIPath.Users}`}
          {...props}
        />
      ),
    },
    {
      groupId: 3,
      id: '3',
      size: 'md',
      title: t('sidebar.reportees'),
      icon: InboxIcon,
      as: (props: any) => (
        <Link
          to={`/${amUIPath.Reportees}`}
          {...props}
        />
      ),
    },
  ];

  const systemUser: MenuItemProps = {
    groupId: 4,
    id: '4',
    size: 'md',
    title: t('sidebar.systemaccess'),
    icon: TenancyIcon,
    as: (props: any) => (
      <Link
        to={`/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`}
        {...props}
      />
    ),
  };

  if (displayConfettiPackage) {
    return [heading, ...confettiPackage, systemUser];
  }

  return [heading, systemUser];
};

import type { ChangeEvent } from 'react';
import React from 'react';
import type { MenuItemProps } from '@altinn/altinn-components';
import { Layout, RootProvider } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { HandshakeIcon, InboxIcon } from '@navikt/aksel-icons';

import type { ReporteeInfo } from '@/rtk/features/userInfoApi';
import { amUIPath } from '@/routes/paths';
import { getAltinnStartPageUrl, getHostUrl } from '@/resources/utils/pathUtils';

interface PageLayoutWrapperProps {
  children?: React.ReactNode;
}

const getAccountType = (type: string): 'company' | 'person' => {
  return type === 'Organization' ? 'company' : 'person';
};

export const PageLayoutWrapperSkeleton = ({
  children,
}: PageLayoutWrapperProps): React.ReactNode => {
  const { t, i18n } = useTranslation();

  const onChangeLocale = (event: ChangeEvent<HTMLInputElement>) => {
    const newLocale = event.target.value;
    i18n.changeLanguage(newLocale);
    document.cookie = `selectedLanguage=${newLocale}; path=/; SameSite=Strict`;
  };

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
  ];

  return (
    <RootProvider>
      <Layout
        color={'company'}
        theme='subtle'
        header={{
          logo: { href: getAltinnStartPageUrl(), title: 'Altinn' },
          currentAccount: {
            name: '',
            type: 'company',
            id: '',
          },
          menu: {
            menuLabel: t('header.menu-label'),
            backLabel: t('header.back-label'),
            changeLabel: t('header.change-label'),
            items: [],
          },
        }}
        sidebar={{
          menu: {
            groups: {},
            items: [],
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

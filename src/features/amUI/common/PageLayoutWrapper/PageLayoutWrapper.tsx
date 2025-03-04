import React, { useMemo } from 'react';
import { Layout, RootProvider } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { SidebarItems } from './SidebarItems';

import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { getAltinnStartPageUrl } from '@/resources/utils/pathUtils';

interface PageLayoutWrapperProps {
  children?: React.ReactNode;
}

export const PageLayoutWrapper = ({ children }: PageLayoutWrapperProps): React.ReactNode => {
  const { t } = useTranslation();
  const { data: reportee } = useGetReporteeQuery();
  const sidebarItems = useMemo(() => SidebarItems(), [window.featureFlags?.confettiPackage]);
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
            id: reportee?.name || '',
          },
          menu: {
            menuLabel: t('header.menu-label'),
            backLabel: t('header.back-label'),
            changeLabel: t('header.change-label'),
            accounts: [
              {
                name: reportee?.name || '',
                selected: true,
                type: reportee?.type === 'Organization' ? 'company' : 'person',
                id: reportee?.name || '',
              },
              { name: 'Test', type: 'person', id: 'test' },
            ],
            items: [],
          },
        }}
        sidebar={{ menu: { groups: {}, items: sidebarItems } }}
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
  { href: 'https://info.altinn.no/om-altinn/', resourceId: 'footer.about_altinn' },
  {
    href: 'https://info.altinn.no/om-altinn/driftsmeldinger/',
    resourceId: 'footer.service_messages',
  },
  { href: 'https://info.altinn.no/om-altinn/personvern/', resourceId: 'footer.privacy_policy' },
  { href: 'https://info.altinn.no/om-altinn/tilgjengelighet/', resourceId: 'footer.accessibility' },
];

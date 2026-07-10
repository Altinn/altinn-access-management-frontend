import React from 'react';
import type { LanguageCode } from '@altinn/altinn-components';
import { Layout, RootProvider, Snackbar, SnackbarProvider } from '@altinn/altinn-components';

import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';

import { useGlobalMenu } from './useGlobalMenu';
import { useFooter } from './useFooter';
import { useHeader } from './useHeader';

import { useTranslation } from 'react-i18next';
import { useSidebarItems } from './useSidebarItems';
import { NavigationFocus } from './NavigationFocus';

interface PageLayoutWrapperProps {
  openAccountMenu?: boolean;
  hideSidebar?: boolean;
  children?: React.ReactNode;
}

const getAccountType = (type: string): 'company' | 'person' => {
  return type === 'Organization' ? 'company' : 'person';
};

export const PageLayoutWrapper = ({
  openAccountMenu = false,
  hideSidebar = false,
  children,
}: PageLayoutWrapperProps): React.ReactNode => {
  const { t } = useTranslation();
  const { data: reportee } = useGetReporteeQuery();

  const { menuGroups } = useGlobalMenu();

  const { header, languageCode } = useHeader({ openAccountMenu, hideSidebarItems: hideSidebar });
  const footer = useFooter();
  const { sidebarItems, shortcutsMenuItem } = useSidebarItems({ isSmall: false });

  const isNewBanner = new Date() >= new Date(2026, 5, 20); // Change to new banner on June 20th, 2026
  const bannerLink = isNewBanner
    ? getBannerLink_new(languageCode as LanguageCode)
    : getBannerLink(languageCode as LanguageCode);

  return (
    <RootProvider languageCode={languageCode as LanguageCode}>
      <NavigationFocus />
      <SnackbarProvider>
        <Layout
          color={reportee?.type ? getAccountType(reportee.type) : 'neutral'}
          theme='subtle'
          header={header}
          banner={{
            title: !isNewBanner ? t('info_banner.info') : t('info_banner.info_new'),
            link: {
              label: !isNewBanner ? t('info_banner.link') : t('info_banner.link_new'),
              href: bannerLink,
            },
            color: !isNewBanner ? 'warning' : undefined,
            variant: !isNewBanner ? 'alert' : undefined,
          }}
          skipLink={{
            href: '#main-content',
            color: 'inherit',
            size: 'xs',
            children: t('common.skiplink'),
          }}
          sidebar={
            hideSidebar
              ? undefined
              : {
                  menu: {
                    groups: menuGroups,
                    items: [...sidebarItems, ...shortcutsMenuItem],
                  },
                }
          }
          content={{ color: reportee?.type ? getAccountType(reportee.type) : 'neutral' }}
          footer={footer}
        >
          <div>{children}</div>
        </Layout>
        <Snackbar />
      </SnackbarProvider>
    </RootProvider>
  );
};

const getBannerLink = (languageCode: LanguageCode) => {
  switch (languageCode) {
    case 'en':
      return 'https://info.altinn.no/en/news/check-if-you-need-to-take-action-before-we-shut-down-the-old-altinn/';
    case 'nn':
      return 'https://info.altinn.no/nn/nyheiter/sjekk-om-du-ma-gjere-noko-for-vi-slar-av-gamle-altinn/';
    default:
      return 'https://info.altinn.no/nyheter/sjekk-om-du-ma-gjore-noe-for-vi-slar-av-gamle-altinn/';
  }
};

const getBannerLink_new = (languageCode: LanguageCode) => {
  switch (languageCode) {
    case 'en':
      return 'https://info.altinn.no/en/news/new-power-of-attorney-solution/';
    case 'nn':
      return 'https://info.altinn.no/nn/nyheiter/ny-fullmaktsloeysing/';
    default:
      return 'https://info.altinn.no/nyheter/ny-fullmaktsloesning/';
  }
};

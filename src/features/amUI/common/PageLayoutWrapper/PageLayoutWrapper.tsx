import React from 'react';
import type { LanguageCode } from '@altinn/altinn-components';
import { Layout, RootProvider, Snackbar } from '@altinn/altinn-components';
import { useLocation } from 'react-router';

import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';

import { InfoModal } from './InfoModal';
import { useGlobalMenu } from './useGlobalMenu';
import { useFooter } from './useFooter';
import { useHeader } from './useHeader';

import { useTranslation } from 'react-i18next';
import { GeneralPath } from '@/routes/paths';
import { useSidebarItems } from './useSidebarItems';

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
  const { pathname, search } = useLocation();

  const { menuGroups } = useGlobalMenu();

  const { header, languageCode } = useHeader({ openAccountMenu, hideSidebarItems: hideSidebar });
  const footer = useFooter();
  const { sidebarItems, shortcutsMenuItem } = useSidebarItems({ isSmall: false });

  const escalateBannerSeverity = new Date() >= new Date(2026, 5, 2); // Escalate to warning on June 2nd, 2026
  const bannerLink = getBannerLink(languageCode as LanguageCode);

  return (
    <RootProvider languageCode={languageCode as LanguageCode}>
      <Layout
        color={reportee?.type ? getAccountType(reportee.type) : 'neutral'}
        theme='subtle'
        header={header}
        banner={{
          title: t('info_banner.info'),
          link: { label: t('info_banner.link'), href: bannerLink },
          color: escalateBannerSeverity ? 'warning' : undefined,
          variant: escalateBannerSeverity ? 'alert' : undefined,
        }}
        skipLink={{
          href:
            pathname === '/'
              ? `${GeneralPath.BasePath}${search}#main-content`
              : `${GeneralPath.BasePath}${pathname}${search}#main-content`,
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
        <InfoModal />
      </Layout>
      <Snackbar />
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

import React from 'react';
import {
  Layout,
  RootProvider,
  Snackbar,
  SnackbarProvider,
  useConsent,
} from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { isOrganization } from '@/resources/utils/reporteeUtils';

import { useGlobalMenu } from './useGlobalMenu';
import { useFooter } from './useFooter';
import { useHeader } from './useHeader';
import { useSidebarItems } from './useSidebarItems';
import { NavigationFocus } from './NavigationFocus';

interface PageLayoutWrapperProps {
  openAccountMenu?: boolean;
  hideSidebar?: boolean;
  children?: React.ReactNode;
}

export const PageLayoutWrapper = ({
  openAccountMenu = false,
  hideSidebar = false,
  children,
}: PageLayoutWrapperProps): React.ReactNode => {
  const { t } = useTranslation();
  const { data: reportee } = useGetReporteeQuery();

  const { menuGroups } = useGlobalMenu();
  const { isAnswered, acceptAll, rejectAll } = useConsent();

  const { header, languageCode } = useHeader({ openAccountMenu, hideSidebarItems: hideSidebar });
  const footer = useFooter();
  const { sidebarItems, shortcutsMenuItem } = useSidebarItems({ isSmall: false });

  return (
    <RootProvider languageCode={languageCode}>
      <NavigationFocus />
      <SnackbarProvider>
        <Layout
          color={reportee ? (isOrganization(reportee) ? 'company' : 'person') : 'neutral'}
          theme='subtle'
          header={header}
          banner={{
            title: t('info_banner.info'),
            link: {
              label: t('info_banner.link'),
              href: getBannerLink(languageCode),
            },
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
          content={{
            color: reportee ? (isOrganization(reportee) ? 'company' : 'person') : 'neutral',
          }}
          footer={footer}
          cookieBanner={
            window.featureFlags?.enableSkyra !== true || isAnswered
              ? undefined
              : { onAccept: acceptAll, onReject: rejectAll }
          }
        >
          <div>{children}</div>
        </Layout>
        <Snackbar />
      </SnackbarProvider>
    </RootProvider>
  );
};

const getBannerLink = (languageCode: string) => {
  switch (languageCode) {
    case 'en':
      return 'https://info.altinn.no/en/news/new-power-of-attorney-solution/';
    case 'nn':
      return 'https://info.altinn.no/nn/nyheiter/ny-fullmaktsloeysing/';
    default:
      return 'https://info.altinn.no/nyheter/ny-fullmaktsloesning/';
  }
};

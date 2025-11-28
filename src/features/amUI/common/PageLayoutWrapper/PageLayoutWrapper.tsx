import React from 'react';
import type { LanguageCode } from '@altinn/altinn-components';
import { Badge, Layout, RootProvider, Snackbar } from '@altinn/altinn-components';
import { useLocation } from 'react-router';

import {
  useGetIsAdminQuery,
  useGetIsClientAdminQuery,
  useGetIsCompanyProfileAdminQuery,
  useGetReporteeQuery,
} from '@/rtk/features/userInfoApi';

import { SidebarItems } from './SidebarItems';
import { InfoModal } from './InfoModal';
import { useNewHeader } from '@/resources/utils/featureFlagUtils';
import { useGlobalMenu } from './useGlobalMenu';
import { useFooter } from './useFooter';
import { useHeader } from './useHeader';

import classes from './PageLayoutWrapper.module.css';
import { useTranslation } from 'react-i18next';
import { GeneralPath } from '@/routes/paths';

interface PageLayoutWrapperProps {
  openAccountMenu?: boolean;
  children?: React.ReactNode;
}

const getAccountType = (type: string): 'company' | 'person' => {
  return type === 'Organization' ? 'company' : 'person';
};

export const PageLayoutWrapper = ({
  openAccountMenu = false,
  children,
}: PageLayoutWrapperProps): React.ReactNode => {
  const { t } = useTranslation();
  const useNewHeaderFlag = useNewHeader();
  const { data: reportee } = useGetReporteeQuery();
  const { pathname, search } = useLocation();

  const { data: isAdmin } = useGetIsAdminQuery();
  const { data: isClientAdmin } = useGetIsClientAdminQuery();
  const { data: canAccessSettings } = useGetIsCompanyProfileAdminQuery();

  const { menuGroups, isLoadingMenu } = useGlobalMenu();

  const { header, languageCode } = useHeader({ openAccountMenu });
  const footer = useFooter();
  const sidebarItems = SidebarItems(
    false,
    isLoadingMenu,
    pathname,
    isAdmin,
    isClientAdmin,
    reportee,
    canAccessSettings ?? false,
  );

  return (
    <RootProvider languageCode={languageCode as LanguageCode}>
      <Layout
        useGlobalHeader={useNewHeaderFlag}
        color={reportee?.type ? getAccountType(reportee.type) : 'neutral'}
        theme='subtle'
        header={header}
        skipLink={{
          href:
            pathname === '/'
              ? `${GeneralPath.BasePath}${search}#main-content`
              : `${GeneralPath.BasePath}${pathname}${search}#main-content`,
          color: 'inherit',
          size: 'xs',
          children: t('common.skiplink'),
        }}
        sidebar={{
          menu: {
            variant: 'subtle',
            groups: menuGroups,
            items: sidebarItems,
          },
          footer: (
            <Badge
              label={t('common.beta')}
              variant='base'
              color='neutral'
            />
          ),
        }}
        content={{ color: reportee?.type ? getAccountType(reportee.type) : 'neutral' }}
        footer={footer}
      >
        <div className={classes.content}>{children}</div>
        <InfoModal />
      </Layout>
      <Snackbar />
    </RootProvider>
  );
};

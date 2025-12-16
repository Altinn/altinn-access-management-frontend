import React from 'react';
import type { LanguageCode } from '@altinn/altinn-components';
import { Badge, Layout, RootProvider, Snackbar } from '@altinn/altinn-components';
import { useLocation } from 'react-router';

import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';

import { InfoModal } from './InfoModal';
import { useGlobalMenu } from './useGlobalMenu';
import { useFooter } from './useFooter';
import { useHeader } from './useHeader';

import classes from './PageLayoutWrapper.module.css';
import { useTranslation } from 'react-i18next';
import { GeneralPath } from '@/routes/paths';
import { useSidebarItems } from './useSidebarItems';

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
  const { data: reportee } = useGetReporteeQuery();
  const { pathname, search } = useLocation();

  const { menuGroups } = useGlobalMenu();

  const { header, languageCode } = useHeader({ openAccountMenu });
  const footer = useFooter();
  const { sidebarItems } = useSidebarItems({ isSmall: false });

  return (
    <RootProvider languageCode={languageCode as LanguageCode}>
      <Layout
        useGlobalHeader
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

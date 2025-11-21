import React from 'react';
import type { LanguageCode } from '@altinn/altinn-components';
import { Layout, RootProvider, Snackbar } from '@altinn/altinn-components';
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
import { useGetPendingSystemUserRequestsQuery } from '@/rtk/features/systemUserApi';

import classes from './PageLayoutWrapper.module.css';

interface PageLayoutWrapperProps {
  children?: React.ReactNode;
}

const getAccountType = (type: string): 'company' | 'person' => {
  return type === 'Organization' ? 'company' : 'person';
};

export const PageLayoutWrapper = ({ children }: PageLayoutWrapperProps): React.ReactNode => {
  const useNewHeaderFlag = useNewHeader();
  const { data: reportee } = useGetReporteeQuery();
  const { pathname } = useLocation();

  const { data: isAdmin } = useGetIsAdminQuery();
  const { data: isClientAdmin } = useGetIsClientAdminQuery();
  const { data: canAccessSettings } = useGetIsCompanyProfileAdminQuery();

  const { data: pendingSystemUsers } = useGetPendingSystemUserRequestsQuery(
    reportee?.partyUuid ?? '',
    {
      skip: !(reportee?.partyUuid && isAdmin),
    },
  );
  const pendingSystemUsersCount = pendingSystemUsers?.length ?? 0;

  const { menuGroups, isLoadingMenu } = useGlobalMenu();

  const { header, languageCode } = useHeader();
  const footer = useFooter();
  const sidebarItems = SidebarItems(
    false,
    isLoadingMenu,
    pathname,
    isAdmin,
    isClientAdmin,
    reportee,
    pendingSystemUsersCount,
    canAccessSettings ?? false,
  );

  return (
    <RootProvider languageCode={languageCode as LanguageCode}>
      <Layout
        useGlobalHeader={useNewHeaderFlag}
        color={reportee?.type ? getAccountType(reportee.type) : 'neutral'}
        theme='subtle'
        header={header}
        sidebar={{
          menu: {
            variant: 'subtle',
            groups: menuGroups,
            items: sidebarItems,
          },
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

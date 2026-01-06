import React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import { DsAlert } from '@altinn/altinn-components';

import { PageWrapper } from '@/components/PageWrapper/PageWrapper';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { clientAdministrationPageEnabled } from '@/resources/utils/featureFlagUtils';
import { useGetIsClientAdminQuery } from '@/rtk/features/userInfoApi';

export const ClientAdministrationPage = () => {
  const { t } = useTranslation();
  const pageIsEnabled = clientAdministrationPageEnabled();
  const { data: isClientAdmin, isLoading: isLoadingIsClientAdmin } = useGetIsClientAdminQuery();

  if (!pageIsEnabled) {
    return (
      <Navigate
        to='/not-found'
        replace
      />
    );
  }

  if (isClientAdmin === false && !isLoadingIsClientAdmin) {
    return (
      <PageWrapper>
        <PageLayoutWrapper>
          <DsAlert data-color='warning'>{t('client_administration_page.no_access_title')}</DsAlert>
        </PageLayoutWrapper>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <h1>{t('sidebar.client_administration')}</h1>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

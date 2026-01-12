import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import { DsAlert, DsHeading, DsParagraph, DsSkeleton, DsTabs } from '@altinn/altinn-components';

import { PageWrapper } from '@/components/PageWrapper/PageWrapper';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { clientAdministrationPageEnabled } from '@/resources/utils/featureFlagUtils';
import { useGetIsClientAdminQuery } from '@/rtk/features/userInfoApi';
import { AddAgentButton } from '../users/NewUserModal/AddAgentModal';

export const ClientAdministrationPage = () => {
  const { t } = useTranslation();
  const pageIsEnabled = clientAdministrationPageEnabled();
  const [activeTab, setActiveTab] = useState('users');
  const {
    data: isClientAdmin,
    isLoading: isLoadingIsClientAdmin,
    isError,
    error,
  } = useGetIsClientAdminQuery();

  if (!pageIsEnabled) {
    return (
      <Navigate
        to='/not-found'
        replace
      />
    );
  }

  if (isLoadingIsClientAdmin) {
    return (
      <PageWrapper>
        <PageLayoutWrapper>
          <DsHeading data-size='lg'>
            <DsSkeleton variant='text'>{t('client_administration_page.page_heading')}</DsSkeleton>
          </DsHeading>
          <DsParagraph data-size='lg'>
            <DsSkeleton
              variant='text'
              width={40}
            />
          </DsParagraph>
        </PageLayoutWrapper>
      </PageWrapper>
    );
  }

  if (isClientAdmin === false) {
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
        <DsHeading data-size='lg'>{t('client_administration_page.page_heading')}</DsHeading>
        <DsTabs
          defaultValue='users'
          data-size='sm'
          value={activeTab}
          onChange={setActiveTab}
        >
          <DsTabs.List>
            <DsTabs.Tab value='users'>
              {t('client_administration_page.agents_tab_title')}
            </DsTabs.Tab>
            <DsTabs.Tab value='clients'>
              {t('client_administration_page.clients_tab_title')}
            </DsTabs.Tab>
          </DsTabs.List>
          <DsTabs.Panel value='users'>
            <AddAgentButton />
          </DsTabs.Panel>
          <DsTabs.Panel value='clients' />
        </DsTabs>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

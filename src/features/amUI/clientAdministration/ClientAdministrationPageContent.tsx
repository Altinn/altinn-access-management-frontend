import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import { DsAlert, DsHeading, DsParagraph, DsSkeleton, DsTabs } from '@altinn/altinn-components';

import { clientAdministrationPageEnabled } from '@/resources/utils/featureFlagUtils';
import { useGetIsClientAdminQuery } from '@/rtk/features/userInfoApi';
import { ClientAdministrationAgentsTab } from './ClientAdministrationAgentsTab';
import { ClientAdministrationClientsTab } from './ClientAdministrationClientsTab';

export const ClientAdministrationPageContent = () => {
  const { t } = useTranslation();
  const pageIsEnabled = clientAdministrationPageEnabled();
  const [activeTab, setActiveTab] = useState('users');
  const { data: isClientAdmin, isLoading: isLoadingIsClientAdmin } = useGetIsClientAdminQuery();

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
      <>
        <DsHeading data-size='lg'>
          <DsSkeleton variant='text'>{t('client_administration_page.page_heading')}</DsSkeleton>
        </DsHeading>
        <DsParagraph data-size='lg'>
          <DsSkeleton
            variant='text'
            width={40}
          />
        </DsParagraph>
      </>
    );
  }

  if (isClientAdmin === false) {
    return (
      <DsAlert data-color='warning'>{t('client_administration_page.no_access_title')}</DsAlert>
    );
  }

  return (
    <>
      <DsHeading data-size='lg'>{t('client_administration_page.page_heading')}</DsHeading>
      <DsTabs
        defaultValue='users'
        data-size='sm'
        value={activeTab}
        onChange={setActiveTab}
      >
        <DsTabs.List>
          <DsTabs.Tab value='users'>{t('client_administration_page.agents_tab_title')}</DsTabs.Tab>
          <DsTabs.Tab value='clients'>
            {t('client_administration_page.clients_tab_title')}
          </DsTabs.Tab>
        </DsTabs.List>
        <DsTabs.Panel value='users'>
          <ClientAdministrationAgentsTab />
        </DsTabs.Panel>
        <DsTabs.Panel value='clients'>{<ClientAdministrationClientsTab />}</DsTabs.Panel>
      </DsTabs>
    </>
  );
};

import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Navigate, useSearchParams } from 'react-router';
import { DsAlert, DsHeading, DsParagraph, DsSkeleton, DsTabs } from '@altinn/altinn-components';

import { clientAdministrationPageEnabled } from '@/resources/utils/featureFlagUtils';
import { useGetIsClientAdminQuery } from '@/rtk/features/userInfoApi';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { ClientAdministrationAgentsTab } from './ClientAdministrationAgentsTab';
import { ClientAdministrationClientsTab } from './ClientAdministrationClientsTab';
import classes from './ClientAdministrationPageContent.module.css';

export const ClientAdministrationPageContent = () => {
  const { t } = useTranslation();
  const pageIsEnabled = clientAdministrationPageEnabled();
  const { actingParty } = usePartyRepresentation();

  const [params, setParams] = useSearchParams();
  const activeTab = params.get('tab') === 'clients' ? 'clients' : 'users';

  const handleTabChange = (value: string) => {
    setParams({ tab: value }, { replace: true });
  };

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
        <DsHeading data-size='md'>
          <DsSkeleton variant='text'>
            {t('client_administration_page.page_heading', { actingparty: '' })}
          </DsSkeleton>
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
      <div className={classes.headerSection}>
        <div className={classes.pageHeader}>
          <DsHeading data-size='sm'>
            <Trans
              i18nKey='client_administration_page.page_heading'
              values={{ actingparty: actingParty?.name ?? '' }}
            />
          </DsHeading>
          <DsParagraph data-size='md'>
            <Trans
              i18nKey='client_administration_page.page_description'
              values={{ 'actingparty.organisationidentifier': actingParty?.orgNumber ?? '' }}
            />
          </DsParagraph>
        </div>
        <DsParagraph
          data-size='md'
          className={classes.pageDescription}
        >
          <Trans
            i18nKey='client_administration_page.forwarding_accesses_info'
            components={{
              a: (
                <a
                  target='_blank'
                  rel='noopener noreferrer'
                />
              ),
            }}
          />
        </DsParagraph>
      </div>
      <DsTabs
        defaultValue='users'
        data-size='sm'
        value={activeTab}
        onChange={handleTabChange}
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

import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import {
  DsAlert,
  DsHeading,
  DsParagraph,
  DsSkeleton,
  DsTabs,
  formatDisplayName,
} from '@altinn/altinn-components';

import { clientAdministrationPageEnabled } from '@/resources/utils/featureFlagUtils';
import {
  PartyType,
  useGetIsClientAdminQuery,
  useGetReporteeQuery,
} from '@/rtk/features/userInfoApi';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { ClientAdministrationAgentsTab } from './ClientAdministrationAgentsTab';
import { ClientAdministrationClientsTab } from './ClientAdministrationClientsTab';
import classes from './ClientAdministrationPageContent.module.css';
import { DatabaseIcon, PersonGroupIcon } from '@navikt/aksel-icons';
import { useUrlParamState } from '../common/useUrlParamState';
import { ReporteePageHeading } from '../common/ReporteePageHeading/ReporteePageHeading';

const clientAdministrationTabs = ['users', 'clients'] as const;

export const ClientAdministrationPageContent = () => {
  const { t } = useTranslation();
  const pageIsEnabled = clientAdministrationPageEnabled();
  const { actingParty } = usePartyRepresentation();

  const [activeTab, setActiveTab] = useUrlParamState({
    key: 'tab',
    defaultValue: 'users',
    validValues: clientAdministrationTabs,
  });

  const { data: reportee, isLoading: isLoadingReportee } = useGetReporteeQuery();
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
            <DsSkeleton
              variant='text'
              width={80}
            />
          </DsSkeleton>
        </DsHeading>
        <DsParagraph data-size='md'>
          <DsSkeleton
            variant='text'
            width={240}
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
          <ReporteePageHeading
            title={t('client_administration_page.page_heading', {
              name: formatDisplayName({
                fullName: actingParty?.name ?? '',
                type: actingParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
              }),
            })}
            reportee={reportee}
            isLoading={isLoadingReportee}
          />
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
        data-size='sm'
        value={activeTab}
        onChange={setActiveTab}
      >
        <DsTabs.List>
          <DsTabs.Tab
            value='users'
            className={classes.tab}
          >
            <PersonGroupIcon aria-hidden='true' />
            {t('client_administration_page.agents_tab_title')}
          </DsTabs.Tab>
          <DsTabs.Tab
            value='clients'
            className={classes.tab}
          >
            <DatabaseIcon aria-hidden='true' />
            {t('client_administration_page.clients_tab_title')}
          </DsTabs.Tab>
        </DsTabs.List>
        <DsTabs.Panel value='users'>
          <ClientAdministrationAgentsTab isActive={activeTab === 'users'} />
        </DsTabs.Panel>
        <DsTabs.Panel value='clients'>
          <ClientAdministrationClientsTab isActive={activeTab === 'clients'} />
        </DsTabs.Panel>
      </DsTabs>
    </>
  );
};

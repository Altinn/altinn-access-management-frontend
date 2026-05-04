import React from 'react';
import { Navigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { DsHeading, DsTabs } from '@altinn/altinn-components';
import { DatabaseIcon, PersonGroupIcon } from '@navikt/aksel-icons';

import { PageWrapper } from '@/components/PageWrapper/PageWrapper';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { enableMaskinportenAdministration } from '@/resources/utils/featureFlagUtils';
import { useGetIsMaskinportenAdminQuery } from '@/rtk/features/userInfoApi';

import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { useUrlParamState } from '../common/useUrlParamState';

import { MaskinportenConsumersTab } from './MaskinportenConsumersTab';
import classes from './MaskinportenPage.module.css';
import { MaskinportenSuppliersTab } from './MaskinportenSuppliersTab';

const maskinportenTabs = ['suppliers', 'consumers'] as const;

export const MaskinportenPage = () => {
  const { t } = useTranslation();
  const party = getCookie('AltinnPartyUuid');
  const [activeTab, setActiveTab] = useUrlParamState({
    key: 'tab',
    defaultValue: 'suppliers',
    validValues: maskinportenTabs,
  });
  const { data: isMaskinportenAdmin, isLoading } = useGetIsMaskinportenAdminQuery(undefined, {
    skip: !enableMaskinportenAdministration(),
  });
  const canFetchTabData = isMaskinportenAdmin === true && enableMaskinportenAdministration();
  useDocumentTitle(t('maskinporten_page.document_title'));

  if (
    (!isLoading && isMaskinportenAdmin !== true) ||
    !enableMaskinportenAdministration() ||
    !party
  ) {
    return (
      <Navigate
        to='/'
        replace
      />
    );
  }

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <PartyRepresentationProvider
          fromPartyUuid={party}
          actingPartyUuid={party}
        >
          <>
            <Breadcrumbs items={['root', 'maskinporten']} />
            <div className={classes.headerSection}>
              <DsHeading
                level={1}
                data-size='lg'
              >
                {t('maskinporten_page.heading')}
              </DsHeading>
            </div>
            <DsTabs
              data-size='sm'
              value={activeTab}
              onChange={setActiveTab}
            >
              <DsTabs.List>
                <DsTabs.Tab value='suppliers'>
                  <PersonGroupIcon aria-hidden='true' />
                  {t('maskinporten_page.suppliers_tab')}
                </DsTabs.Tab>
                <DsTabs.Tab value='consumers'>
                  <DatabaseIcon aria-hidden='true' />
                  {t('maskinporten_page.consumers_tab')}
                </DsTabs.Tab>
              </DsTabs.List>
              <DsTabs.Panel value='suppliers'>
                <MaskinportenSuppliersTab
                  party={party}
                  isActive={activeTab === 'suppliers'}
                  canFetch={canFetchTabData}
                />
              </DsTabs.Panel>
              <DsTabs.Panel value='consumers'>
                <MaskinportenConsumersTab
                  party={party}
                  isActive={activeTab === 'consumers'}
                  canFetch={canFetchTabData}
                />
              </DsTabs.Panel>
            </DsTabs>
          </>
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

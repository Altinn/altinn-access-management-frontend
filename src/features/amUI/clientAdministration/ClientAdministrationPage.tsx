import React from 'react';
import { useTranslation } from 'react-i18next';

import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';

import { ClientAdministrationPageContent } from './ClientAdministrationPageContent';

import { PageWrapper } from '@/components/PageWrapper/PageWrapper';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';

export const ClientAdministrationPage = () => {
  const { t } = useTranslation();

  useDocumentTitle(t('client_administration_page.page_title'));

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <PartyRepresentationProvider
          fromPartyUuid={getCookie('AltinnPartyUuid')}
          actingPartyUuid={getCookie('AltinnPartyUuid')}
        >
          <Breadcrumbs items={['root', 'client_administration']} />
          <ClientAdministrationPageContent />
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

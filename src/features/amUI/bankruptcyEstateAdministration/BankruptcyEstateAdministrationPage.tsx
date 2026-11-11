import React from 'react';
import { useTranslation } from 'react-i18next';

import { PageWrapper } from '@/components/PageWrapper/PageWrapper';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';

import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';

import { BankruptcyEstateAdministrationPageContent } from './BankruptcyEstateAdministrationPageContent';

export const BankruptcyEstateAdministrationPage = () => {
  const { t } = useTranslation();

  useDocumentTitle(t('bankruptcy_estate_administration_page.page_title'));

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <PartyRepresentationProvider
          fromPartyUuid={getCookie('AltinnPartyUuid')}
          actingPartyUuid={getCookie('AltinnPartyUuid')}
        >
          <Breadcrumbs items={['root', 'bankruptcy_estate_administration']} />
          <BankruptcyEstateAdministrationPageContent />
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

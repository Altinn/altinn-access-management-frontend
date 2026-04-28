import React from 'react';
import { Navigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { DsHeading } from '@altinn/altinn-components';

import { PageWrapper } from '@/components/PageWrapper/PageWrapper';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';
import { useGetIsMaskinportenAdminQuery } from '@/rtk/features/userInfoApi';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { enableMaskinportenAdministration } from '@/resources/utils/featureFlagUtils';

export const MaskinportenPage = () => {
  const { t } = useTranslation();
  const { data: isMaskinportenAdmin, isLoading } = useGetIsMaskinportenAdminQuery(undefined, {
    skip: !enableMaskinportenAdministration(),
  });
  useDocumentTitle(t('maskinporten_page.document_title'));

  if ((!isLoading && isMaskinportenAdmin === false) || !enableMaskinportenAdministration()) {
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
        <Breadcrumbs items={['root', 'maskinporten']} />
        <DsHeading
          level={1}
          data-size='lg'
        >
          {t('maskinporten_page.heading')}
        </DsHeading>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

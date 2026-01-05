import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate } from 'react-router';
import { DsAlert, DsButton, DsHeading, DsParagraph } from '@altinn/altinn-components';

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
          <DsAlert data-color='warning'>
            <DsHeading
              level={1}
              data-size='xs'
            >
              {t('client_administration_page.no_access_title')}
            </DsHeading>
            <DsParagraph data-size='sm'>
              {t('client_administration_page.no_access_body')}
            </DsParagraph>
            <DsButton
              asChild
              variant='secondary'
            >
              <Link to='/'>{t('client_administration_page.back_to_start')}</Link>
            </DsButton>
          </DsAlert>
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

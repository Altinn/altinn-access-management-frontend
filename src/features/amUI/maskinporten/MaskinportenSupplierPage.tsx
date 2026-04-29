import React from 'react';
import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsHeading, DsParagraph, DsSkeleton } from '@altinn/altinn-components';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { PageWrapper } from '@/components/PageWrapper/PageWrapper';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { useGetMaskinportenSuppliersQuery } from '@/rtk/features/maskinportenApi';
import { amUIPath } from '@/routes/paths';

import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';

const isPartyNotFoundError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object' || !('status' in error)) return false;
  const fetchError = error as FetchBaseQueryError;
  if (fetchError.status !== 400) return false;
  return JSON.stringify(fetchError.data).includes('AM-00023');
};

export const MaskinportenSupplierPage = () => {
  const { t } = useTranslation();
  const { id: orgNr } = useParams<{ id: string }>();
  const party = getCookie('AltinnPartyUuid');

  const { supplier, isLoading, error } = useGetMaskinportenSuppliersQuery(
    { party, supplier: orgNr },
    {
      skip: !party || !orgNr,
      selectFromResult: ({ data, isLoading, error }) => ({
        supplier: data?.[0],
        isLoading,
        error,
      }),
    },
  );

  const supplierName = supplier?.party.name;

  useDocumentTitle(supplierName ?? t('maskinporten_page.document_title'));

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <Breadcrumbs
          items={['root', 'maskinporten']}
          lastBreadcrumb={{ label: supplierName }}
        />
        {isPartyNotFoundError(error) ? (
          <DsAlert data-color='warning'>
            <DsParagraph>
              {t('maskinporten_page.supplier_not_found')}{' '}
              <Link to={`/${amUIPath.Maskinporten}`}>{t('common.go_back')}</Link>
            </DsParagraph>
          </DsAlert>
        ) : (
          <DsHeading
            level={1}
            data-size='lg'
          >
            {isLoading ? <DsSkeleton variant='text'>XXXXXXXXXXXXXXXX</DsSkeleton> : supplierName}
          </DsHeading>
        )}
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

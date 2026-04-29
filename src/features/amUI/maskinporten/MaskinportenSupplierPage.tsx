import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  DsAlert,
  DsHeading,
  DsParagraph,
  DsSkeleton,
  formatDisplayName,
} from '@altinn/altinn-components';

import { PageWrapper } from '@/components/PageWrapper/PageWrapper';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { useGetMaskinportenSuppliersQuery } from '@/rtk/features/maskinportenApi';
import { amUIPath } from '@/routes/paths';

import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { Party } from '@/rtk/features/lookupApi';
import { PartyType } from '@/rtk/features/userInfoApi';

export const MaskinportenSupplierPage = () => {
  const { t } = useTranslation();

  useDocumentTitle(t('maskinporten_page.supplier_title'));

  const { id: orgNr } = useParams<{ id: string }>();
  const party = getCookie('AltinnPartyUuid');

  const { data, isLoading, error } = useGetMaskinportenSuppliersQuery(
    { party, supplier: orgNr },
    { skip: !party || !orgNr },
  );

  const supplier = data?.[0];
  const supplierName = supplier?.party.name
    ? formatDisplayName({ fullName: supplier?.party.name, type: 'company' })
    : '';

  const supplierParty = useMemo((): Party | undefined => {
    const party = supplier?.party;
    if (!party) {
      return undefined;
    }
    return {
      partyUuid: party.id,
      partyId: 0, // Not used in this context
      name: party.name,
      partyTypeName: PartyType.Organization,
      orgNumber: party.organizationIdentifier ?? '',
      isDeleted: party.isDeleted ?? false,
    };
  }, [supplier]);

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <PartyRepresentationProvider
          fromPartyUuid={party}
          actingPartyUuid={party}
          toPartyOverride={supplierParty}
        >
          <>
            <Breadcrumbs
              items={['root', 'maskinporten']}
              lastBreadcrumb={{ label: supplierName ?? t('maskinporten_page.supplier_title') }}
            />

            {error ? (
              <DsAlert data-color='error'>
                <DsParagraph>
                  {t('maskinporten_page.supplier_not_found')}{' '}
                  <Link to={`/${amUIPath.Maskinporten}`}>
                    {t('maskinporten_page.back_to_list')}
                  </Link>
                </DsParagraph>
              </DsAlert>
            ) : isLoading ? (
              <DsSkeleton
                width='100%'
                height='2.5rem'
              />
            ) : (
              <DsHeading
                level={1}
                data-size='lg'
              >
                {supplierName}
              </DsHeading>
            )}
          </>
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

import { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph, DsSkeleton, formatDisplayName } from '@altinn/altinn-components';

import { PageWrapper } from '@/components/PageWrapper/PageWrapper';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import type { Party } from '@/rtk/features/lookupApi';
import { useGetMaskinportenSuppliersQuery } from '@/rtk/features/maskinportenApi';
import { PartyType } from '@/rtk/features/userInfoApi';
import { amUIPath } from '@/routes/paths';

import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';
import { DelegationModalProvider } from '../common/DelegationModal/DelegationModalContext';
import { PageContainer } from '../common/PageContainer/PageContainer';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { SupplierPageContent } from './SupplierPageContent';

export const SupplierPage = () => {
  const { t } = useTranslation();

  useDocumentTitle(t('maskinporten_page.supplier_title'));

  const { id: orgNr } = useParams<{ id: string }>();
  const party = getCookie('AltinnPartyUuid');
  const backUrl = `/${amUIPath.Maskinporten}#suppliers`;

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
      partyId: 0,
      name: party.name,
      partyTypeName: PartyType.Organization,
      orgNumber: party.organizationIdentifier ?? '',
      isDeleted: party.isDeleted ?? false,
      variant: party.variant ?? '',
    };
  }, [supplier]);

  const notFound = !!error || (!isLoading && !data?.length);

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <PartyRepresentationProvider
          fromPartyUuid={party}
          actingPartyUuid={party}
          toPartyOverride={supplierParty}
        >
          <DelegationModalProvider>
            <Breadcrumbs
              items={['root', 'maskinporten_suppliers']}
              lastBreadcrumb={{ label: supplierName || t('maskinporten_page.supplier_title') }}
            />
            {isLoading ? (
              <PageContainer backUrl={backUrl}>
                <DsSkeleton
                  width='100%'
                  height='2.5rem'
                />
              </PageContainer>
            ) : notFound ? (
              <PageContainer backUrl={backUrl}>
                <DsAlert data-color='danger'>
                  <DsParagraph>
                    {t('maskinporten_page.supplier_not_found')}{' '}
                    <Link to={backUrl}>{t('maskinporten_page.back_to_list')}</Link>
                  </DsParagraph>
                </DsAlert>
              </PageContainer>
            ) : (
              <SupplierPageContent />
            )}
          </DelegationModalProvider>
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

import { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph, DsSkeleton, formatDisplayName } from '@altinn/altinn-components';

import { PageWrapper } from '@/components/PageWrapper/PageWrapper';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import type { Party } from '@/rtk/features/lookupApi';
import { useGetMaskinportenConsumersQuery } from '@/rtk/features/maskinportenApi';
import { PartyType } from '@/rtk/features/userInfoApi';
import { amUIPath } from '@/routes/paths';

import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';
import { DelegationModalProvider } from '../common/DelegationModal/DelegationModalContext';
import { PageContainer } from '../common/PageContainer/PageContainer';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { ConsumerPageContent } from './ConsumerPageContent';

export const ConsumerPage = () => {
  const { t } = useTranslation();

  useDocumentTitle(t('maskinporten_page.consumer_title'));

  const { id: orgNr } = useParams<{ id: string }>();
  const party = getCookie('AltinnPartyUuid');
  const backUrl = `/${amUIPath.Maskinporten}#consumers`;

  const { data, isLoading, error } = useGetMaskinportenConsumersQuery(
    { party, consumer: orgNr },
    { skip: !party || !orgNr },
  );

  const consumer = data?.[0];
  const consumerName = consumer?.party.name
    ? formatDisplayName({ fullName: consumer?.party.name, type: 'company' })
    : '';

  const consumerParty = useMemo((): Party | undefined => {
    const party = consumer?.party;
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
    };
  }, [consumer]);

  const notFound = !!error || (!isLoading && !data?.length);

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <PartyRepresentationProvider
          toPartyUuid={party}
          actingPartyUuid={party}
          fromPartyOverride={consumerParty}
        >
          <DelegationModalProvider>
            <Breadcrumbs
              items={['root', 'maskinporten_consumers']}
              lastBreadcrumb={{ label: consumerName || t('maskinporten_page.consumer_title') }}
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
                    {t('maskinporten_page.consumer_not_found')}{' '}
                    <Link to={backUrl}>{t('maskinporten_page.back_to_list')}</Link>
                  </DsParagraph>
                </DsAlert>
              </PageContainer>
            ) : (
              <ConsumerPageContent />
            )}
          </DelegationModalProvider>
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsHeading, DsParagraph, formatDisplayName } from '@altinn/altinn-components';
import { useParams } from 'react-router';

import { PageWrapper } from '@/components/PageWrapper/PageWrapper';
import { amUIPath } from '@/routes/paths';

import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PageContainer } from '../common/PageContainer/PageContainer';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';
import { ClientAdministrationAgentDeleteModal } from '../clientAdministration/ClientAdministrationAgentDeleteModal';
import { PartyType } from '@/rtk/features/userInfoApi';

export const ClientAdministrationAgentDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { toParty } = usePartyRepresentation();

  const backUrl = `/${amUIPath.ClientAdministration}`;
  const userName = formatDisplayName({
    fullName: toParty?.name || '',
    type: toParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
  });
  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <Breadcrumbs
          items={['root', 'client_administration']}
          lastBreadcrumb={{
            label: toParty?.name
              ? formatDisplayName({
                  fullName: toParty?.name || '',
                  type: toParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
                })
              : '',
          }}
        />
        <PageContainer
          backUrl={backUrl}
          contentActions={
            id ? (
              <ClientAdministrationAgentDeleteModal
                agentId={id}
                backUrl={backUrl}
              />
            ) : null
          }
        >
          <DsHeading data-size='lg'>{userName}</DsHeading>

          {!id && (
            <DsAlert data-color='warning'>
              <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
            </DsAlert>
          )}
        </PageContainer>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

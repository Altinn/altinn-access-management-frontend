import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsHeading, DsParagraph, formatDisplayName } from '@altinn/altinn-components';
import { useParams } from 'react-router';

import { PageWrapper } from '@/components/PageWrapper/PageWrapper';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { amUIPath } from '@/routes/paths';

import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PageContainer } from '../common/PageContainer/PageContainer';
import {
  PartyRepresentationProvider,
  usePartyRepresentation,
} from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';
import { ClientAdministrationAgentDeleteModal } from './ClientAdministrationAgentDeleteModal';
import { PartyType } from '@/rtk/features/userInfoApi';

export const ClientAdministrationAgentDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const backUrl = `/${amUIPath.ClientAdministration}`;
  const { toParty } = usePartyRepresentation();
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
            <ClientAdministrationAgentDeleteModal
              agentId={id}
              backUrl={backUrl}
            />
          }
        >
          <DsHeading data-size='lg'>
            {t('client_administration_page.agent_details_heading')}
          </DsHeading>
          <DsHeading data-size='sm'>
            {t('client_administration_page.agent_access_packages_heading')}
          </DsHeading>
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

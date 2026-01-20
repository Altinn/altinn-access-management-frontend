import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DsAlert,
  DsHeading,
  DsParagraph,
  DsSkeleton,
  formatDisplayName,
} from '@altinn/altinn-components';
import { useParams } from 'react-router';

import { amUIPath } from '@/routes/paths';

import { PageContainer } from '../common/PageContainer/PageContainer';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';
import { ClientAdministrationAgentDeleteModal } from './ClientAdministrationAgentDeleteModal';
import { PartyType, useGetIsClientAdminQuery } from '@/rtk/features/userInfoApi';

export const ClientAdministrationAgentDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { toParty } = usePartyRepresentation();
  const { data: isClientAdmin, isLoading: isLoadingIsClientAdmin } = useGetIsClientAdminQuery();

  if (isLoadingIsClientAdmin) {
    return (
      <>
        <DsHeading data-size='lg'>
          <DsSkeleton variant='text'>{t('client_administration_page.page_heading')}</DsSkeleton>
        </DsHeading>
        <DsParagraph data-size='lg'>
          <DsSkeleton
            variant='text'
            width={40}
          />
        </DsParagraph>
      </>
    );
  }

  if (isClientAdmin === false) {
    return (
      <DsAlert data-color='warning'>{t('client_administration_page.no_access_title')}</DsAlert>
    );
  }

  const backUrl = `/${amUIPath.ClientAdministration}`;
  const userName = formatDisplayName({
    fullName: toParty?.name || '',
    type: toParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
  });

  return (
    <>
      <Breadcrumbs
        items={['root', 'client_administration']}
        lastBreadcrumb={{
          label: toParty?.name ? userName : '',
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
    </>
  );
};
